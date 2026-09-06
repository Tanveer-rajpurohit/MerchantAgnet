import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.customer_connection import CustomerConnection
from app.models.conversation import SenderType, SendStatus
from app.services import message_service
from app.repositories import customer_connection_repository, message_repository
from app.websockets.manager import manager
from app.schemas.message import (
    PaginatedMessageResponse,
    DirectMessageRequest,
    DirectMessageResponse,
)

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get(
    "/{customer_connection_id}",
    response_model=PaginatedMessageResponse,
)
async def list_messages(
    customer_connection_id: uuid.UUID,
    cursor: datetime | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await message_service.list_connection_messages(
        db=db,
        connection_id=customer_connection_id,
        current_user=current_user,
        cursor=cursor,
        limit=limit,
    )


@router.post(
    "/send-direct",
    response_model=DirectMessageResponse,
)
async def send_direct_message(
    payload: DirectMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = current_user.merchant_profile
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Merchant profile not found for this account",
        )

    merchant_id = profile.id
    content = payload.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty",
        )

    conn: CustomerConnection | None = None

    if payload.customer_connection_id:
        conn = await customer_connection_repository.get_by_id(
            db=db,
            connection_id=payload.customer_connection_id,
            merchant_id=merchant_id,
        )

    if not conn and payload.customer_phone:
        clean_p = "".join(filter(str.isdigit, payload.customer_phone))[-10:]
        if len(clean_p) >= 10:
            stmt = (
                select(CustomerConnection)
                .join(User, User.id == CustomerConnection.customer_id)
                .where(
                    CustomerConnection.merchant_id == merchant_id,
                    User.phone_number.contains(clean_p),
                )
                .options(selectinload(CustomerConnection.customer))
                .limit(1)
            )
            conn = (await db.execute(stmt)).scalars().first()

            if not conn:
                u_stmt = select(User).where(User.phone_number.contains(clean_p)).limit(1)
                found_u = (await db.execute(u_stmt)).scalars().first()
                if found_u:
                    conn = await customer_connection_repository.get_or_create_connection(
                        db=db,
                        merchant_id=merchant_id,
                        customer_id=found_u.id,
                    )

    if not conn and payload.customer_name:
        term = payload.customer_name.strip()
        if term and term.lower() not in ("", "customer", "the customer"):
            stmt = (
                select(CustomerConnection)
                .join(User, User.id == CustomerConnection.customer_id)
                .where(
                    CustomerConnection.merchant_id == merchant_id,
                    User.full_name.ilike(f"%{term}%"),
                )
                .options(selectinload(CustomerConnection.customer))
                .limit(1)
            )
            conn = (await db.execute(stmt)).scalars().first()

            if not conn:
                u_stmt = select(User).where(User.full_name.ilike(f"%{term}%")).limit(1)
                found_u = (await db.execute(u_stmt)).scalars().first()
                if found_u:
                    conn = await customer_connection_repository.get_or_create_connection(
                        db=db,
                        merchant_id=merchant_id,
                        customer_id=found_u.id,
                    )

    if not conn:
        recent_conns = await customer_connection_repository.list_by_merchant(
            db=db,
            merchant_id=merchant_id,
            limit=1,
        )
        if recent_conns:
            conn = recent_conns[0]

    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find customer connection for '{payload.customer_name or payload.customer_phone or 'the customer'}'.",
        )

    if not conn.customer:
        conn = await customer_connection_repository.get_by_id(db=db, connection_id=conn.id)

    saved_msg = await message_repository.save_message_to_connection(
        db=db,
        customer_connection_id=conn.id,
        sender_type=SenderType.merchant,
        content=content,
        status=SendStatus.sent,
    )
    await db.commit()

    msg_payload = {
        "id": str(saved_msg.id),
        "conversation_id": str(saved_msg.conversation_id),
        "sender_type": saved_msg.sender_type.value,
        "content": saved_msg.content,
        "status": saved_msg.status.value,
        "created_at": saved_msg.created_at.isoformat(),
    }
    await manager.broadcast(
        connection_id=conn.id,
        message={"type": "new_message", "message": msg_payload},
    )

    cust_name = conn.customer.full_name if conn.customer else (payload.customer_name or "Customer")
    return DirectMessageResponse(
        success=True,
        message_id=str(saved_msg.id),
        connection_id=str(conn.id),
        customer_name=cust_name,
        content=saved_msg.content,
    )

