import json
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.db.session import AsyncSessionLocal
from app.models.conversation import SenderType, SendStatus
from app.repositories import message_repository
from app.websockets.manager import manager

router = APIRouter(tags=["WebSockets"])

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

            await websocket.send_json({"type": "message_sent", "message": message_data})
            await manager.broadcast(
                connection_id=connection_id,
                message={"type": "new_message", "message": message_data},
                exclude=websocket,
            )
    except WebSocketDisconnect:
        manager.disconnect(connection_id, websocket)
    except Exception:
        manager.disconnect(connection_id, websocket)
