import json
import uuid
import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.conversation import SenderType, SendStatus
from app.models.customer_connection import CustomerConnection
from app.models.merchant_profile import MerchantProfile
from app.models.address import Address
from app.models.user import User
from app.repositories import message_repository
from app.websockets.manager import manager
from app.services.agent_service import run_customer_chat, _build_store_profile

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSockets"])


async def _resolve_store_context(db, connection: CustomerConnection):
    """Load the merchant profile + store profile for a customer connection."""
    merchant = await db.get(MerchantProfile, connection.merchant_id)
    if not merchant:
        return None, None
    # owner user for name/phone/address
    user_stmt = select(User).where(User.id == merchant.user_id)
    owner = (await db.execute(user_stmt)).scalar_one_or_none()
    if owner is None:
        return merchant, None
    addr_stmt = select(Address).where(Address.user_id == owner.id).order_by(Address.is_default.desc())
    addr = (await db.execute(addr_stmt)).scalars().first()
    store_profile = _build_store_profile(merchant, owner, addr)
    return merchant, store_profile


@router.websocket("/ws/chat/{connection_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    connection_id: uuid.UUID,
    role: str = Query("customer"),
) -> None:
    await manager.connect(connection_id, websocket, role=role)
    try:
        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data) if raw_data.startswith("{") else {"content": raw_data}

            content = str(payload.get("content", "")).strip()
            if not content:
                continue

            raw_sender = payload.get("sender_type", role)
            sender_type = SenderType.customer
            if raw_sender in [s.value for s in SenderType]:
                sender_type = SenderType(raw_sender)

            # 1. Persist the inbound message
            async with AsyncSessionLocal() as db:
                saved_message = await message_repository.save_message_to_connection(
                    db=db,
                    customer_connection_id=connection_id,
                    sender_type=sender_type,
                    content=content,
                    status=SendStatus.sent,
                )
                await db.commit()

            message_data = {
                "id": str(saved_message.id),
                "conversation_id": str(saved_message.conversation_id),
                "sender_type": saved_message.sender_type.value,
                "content": saved_message.content,
                "status": saved_message.status.value,
                "created_at": saved_message.created_at.isoformat(),
            }

            # 2. Relay to the other participants
            await websocket.send_json({"type": "message_sent", "message": message_data})
            await manager.broadcast(
                connection_id=connection_id,
                message={"type": "new_message", "message": message_data},
                exclude=websocket,
            )

            # 3. If the customer spoke and the merchant is offline, let the
            #    customer_shopfront agent answer using the store catalog.
            if sender_type == SenderType.customer and not manager.is_merchant_online(connection_id):
                # Broadcast typing indicator so customer knows AI is actively processing
                await manager.broadcast(
                    connection_id=connection_id,
                    message={"type": "ai_typing", "is_typing": True},
                )

                ai_text = ""
                tools_used: list[dict] = []
                try:
                    async with AsyncSessionLocal() as db:
                        conn = await db.get(CustomerConnection, connection_id)
                        if conn is None:
                            ai_text = "This store connection could not be found."
                        else:
                            merchant, store_profile = await _resolve_store_context(db, conn)
                            if merchant is None or store_profile is None:
                                ai_text = "The store is unavailable right now. Please try again later."
                            else:
                                customer_user = None
                                if conn.customer_id:
                                    customer_user = await db.get(User, conn.customer_id)

                                ai_text, tools_used = await run_customer_chat(
                                    db=db,
                                    merchant_profile=merchant,
                                    store_profile=store_profile,
                                    customer=customer_user,
                                    message=content,
                                    connection_id=connection_id,
                                )
                except Exception as agent_err:
                    logger.exception("Customer agent failed: %s", agent_err)
                    ai_text = (
                        "I'm sorry, I couldn't process that just now. Please message the "
                        "store directly and the owner will get back to you."
                    )
                finally:
                    await manager.broadcast(
                        connection_id=connection_id,
                        message={"type": "ai_typing", "is_typing": False},
                    )

                # 4. Persist + broadcast the agent reply
                async with AsyncSessionLocal() as db:
                    ai_saved = await message_repository.save_message_to_connection(
                        db=db,
                        customer_connection_id=connection_id,
                        sender_type=SenderType.agent,
                        content=ai_text,
                        status=SendStatus.sent,
                    )
                    await db.commit()

                ai_message_data = {
                    "id": str(ai_saved.id),
                    "conversation_id": str(ai_saved.conversation_id),
                    "sender_type": ai_saved.sender_type.value,
                    "content": ai_saved.content,
                    "status": ai_saved.status.value,
                    "created_at": ai_saved.created_at.isoformat(),
                }
                await manager.broadcast(
                    connection_id=connection_id,
                    message={"type": "new_message", "message": ai_message_data},
                )
    except WebSocketDisconnect:
        manager.disconnect(connection_id, websocket)
    except Exception:
        logger.exception("WebSocket chat error for connection %s", connection_id)
        manager.disconnect(connection_id, websocket)
