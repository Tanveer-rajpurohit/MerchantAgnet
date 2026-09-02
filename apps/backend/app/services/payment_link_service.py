import hmac
import hashlib
import uuid
from decimal import Decimal
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security_crypto import decrypt_credential
from app.models.user import User
from app.models.merchant_profile import MerchantProfile
from app.models.order import Order, OrderStatus
from app.models.customer_connection import CustomerConnection
from app.models.payment_link import PaymentLink, PaymentLinkStatus
from app.schemas.payment_link import PaymentLinkCreateRequest, PaymentLinkVerifyRequest
from app.services.razorpay_client_factory import get_merchant_razorpay_client
from app.repositories import payment_link_repository, audit_log_repository

async def create_payment_link(
    db: AsyncSession,
    merchant: MerchantProfile,
    payload: PaymentLinkCreateRequest,
    user_id: uuid.UUID,
) -> PaymentLink:
    client = get_merchant_razorpay_client(merchant)

    # Customer ID Resolution
    resolved_customer_id = payload.customer_id
    if resolved_customer_id is None and payload.order_id:
        order = await db.get(Order, payload.order_id)
        if order:
            resolved_customer_id = order.customer_id
    elif resolved_customer_id is None and payload.customer_phone:
        clean_p = "".join(filter(str.isdigit, payload.customer_phone))
        if len(clean_p) >= 10:
            user_stmt = select(User).where(User.phone_number.ilike(f"%{clean_p[-10:]}%"))
            user_res = await db.execute(user_stmt)
            existing_user = user_res.scalar_one_or_none()
            if existing_user:
                resolved_customer_id = existing_user.id
    
    amount_in_paise = int(payload.amount * 100)
    receipt_no = f"rcpt_{uuid.uuid4().hex[:8]}"
    callback_url = f"{settings.FRONTEND_URL}/payment-success"

    razorpay_payload = {
        "amount": amount_in_paise,
        "currency": payload.currency,
        "accept_partial": False,
        "description": payload.description,
        "customer": {
            "name": payload.customer_name,
        },
        "notify": {
            "sms": payload.notify_sms,
            "email": payload.notify_email,
        },
        "reminder_enable": True,
        "callback_url": callback_url,
        "callback_method": "get",
    }

    if payload.customer_phone:
        clean_phone = "".join(filter(str.isdigit, payload.customer_phone))
        if len(clean_phone) >= 10:
            razorpay_payload["customer"]["contact"] = f"+91{clean_phone[-10:]}"
    if payload.customer_email:
        razorpay_payload["customer"]["email"] = payload.customer_email

    try:
        razorpay_resp = client.payment_link.create(razorpay_payload)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Razorpay link creation failed: {str(e)}",
        )
    
    link = await payment_link_repository.create_payment_link(
        db=db,
        merchant_id=merchant.id,
        amount=payload.amount,
        currency=payload.currency,
        customer_name=payload.customer_name,
        description=payload.description,
        customer_phone=payload.customer_phone,
        customer_email=payload.customer_email,
        customer_id=resolved_customer_id,
        order_id=payload.order_id,
        receipt_number=receipt_no,
        razorpay_link_id=razorpay_resp.get("id"),
        razorpay_link_url=razorpay_resp.get("short_url"),
        callback_url=callback_url,
        callback_method="get",
        notify_sms=payload.notify_sms,
        notify_email=payload.notify_email,
    )

    await audit_log_repository.log_action(
        db=db,
        action="payment_link.created",
        entity_type="payment_link",
        entity_id=str(link.id),
        merchant_id=merchant.id,
        user_id=user_id,
        details={
            "amount": str(payload.amount),
            "razorpay_link_id": razorpay_resp.get("id"),
            "customer_name": payload.customer_name,
            "customer_id": str(resolved_customer_id) if resolved_customer_id else None,
        },
    )

    return link

async def verify_payment_callback(
    db: AsyncSession,
    payload: PaymentLinkVerifyRequest,
) -> PaymentLink:
    link = await payment_link_repository.get_by_razorpay_link_id(
        db=db,
        razorpay_link_id=payload.razorpay_payment_link_id,
    )
    if not link:
        raise HTTPException(status_code=404, detail="Payment link record not found")

    if link.status == PaymentLinkStatus.paid:
        return link
    merchant = link.merchant
    if not merchant:
        merchant = await db.get(MerchantProfile, link.merchant_id)
    if not merchant or not merchant.razorpay_key_secret_encrypted:
        raise HTTPException(status_code=400, detail="Merchant gateway credentials missing")
    
    key_secret = decrypt_credential(merchant.razorpay_key_secret_encrypted)
    
    # HMAC-SHA256 handshake verification
    # Razorpay Payment Link callback signature specification:
    # msg = f"{payment_link_id}|{payment_link_reference_id}|{payment_link_status}|{payment_id}"
    ref_id = payload.razorpay_payment_link_reference_id or ""
    status_str = payload.razorpay_payment_link_status or "paid"
    expected_message = f"{payload.razorpay_payment_link_id}|{ref_id}|{status_str}|{payload.razorpay_payment_id}"
    computed_signature = hmac.new(
        key=key_secret.encode("utf-8"),
        msg=expected_message.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    is_valid = hmac.compare_digest(computed_signature, payload.razorpay_signature)
    if not is_valid:
        alt_message = f"{payload.razorpay_payment_link_id}|{payload.razorpay_payment_id}"
        alt_signature = hmac.new(
            key=key_secret.encode("utf-8"),
            msg=alt_message.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).hexdigest()
        is_valid = hmac.compare_digest(alt_signature, payload.razorpay_signature)

    if not is_valid:
        try:
            client = get_merchant_razorpay_client(merchant)
            params = {
                "payment_link_id": payload.razorpay_payment_link_id,
                "payment_link_reference_id": ref_id,
                "payment_link_status": status_str,
                "razorpay_payment_id": payload.razorpay_payment_id,
                "razorpay_signature": payload.razorpay_signature,
            }
            client.utility.verify_payment_link_signature(params)
            is_valid = True
        except Exception:
            pass

    if not is_valid:
        try:
            client = get_merchant_razorpay_client(merchant)
            remote = client.payment_link.fetch(payload.razorpay_payment_link_id)
            if remote.get("status") == "paid":
                is_valid = True
        except Exception:
            pass

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Mark link as paid
    updated_link = await payment_link_repository.mark_as_paid(
        db=db,
        payment_link=link,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature,
    )

    # If linked to an order, update order status to paid
    if link.order_id:
        order = await db.get(Order, link.order_id)
        if order:
            order.status = OrderStatus.paid
            order.paid_amount = link.amount
    
    # If customer_id is present, update CustomerConnection.total_spent
    if link.customer_id:
        conn_stmt = select(CustomerConnection).where(
            CustomerConnection.merchant_id == merchant.id,
            CustomerConnection.customer_id == link.customer_id,
        )
        conn_res = await db.execute(conn_stmt)
        conn = conn_res.scalar_one_or_none()
        if conn:
            conn.total_spent = (conn.total_spent or Decimal("0.00")) + link.amount

    await audit_log_repository.log_action(
        db=db,
        action="payment_link.paid",
        entity_type="payment_link",
        entity_id=str(link.id),
        merchant_id=merchant.id,
        details={
            "razorpay_payment_id": payload.razorpay_payment_id,
            "amount": str(link.amount),
            "customer_id": str(link.customer_id) if link.customer_id else None,
        },
    )
    
    await db.commit()
    return updated_link

async def sync_link_status(
    db: AsyncSession,
    merchant: MerchantProfile,
    link_id: uuid.UUID,
) -> PaymentLink:
    link = await payment_link_repository.get_by_id(db, link_id, merchant.id)
    if not link:
        raise HTTPException(status_code=404, detail="Payment link not found")
    if not link.razorpay_link_id:
        return link
    client = get_merchant_razorpay_client(merchant)
    try:
        remote = client.payment_link.fetch(link.razorpay_link_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch Razorpay status: {str(e)}")
    
    remote_status = remote.get("status")
    status_map = {
        "created": PaymentLinkStatus.created,
        "partially_paid": PaymentLinkStatus.partially_paid,
        "paid": PaymentLinkStatus.paid,
        "cancelled": PaymentLinkStatus.cancelled,
        "expired": PaymentLinkStatus.expired,
    }

    new_status = status_map.get(remote_status, link.status)
    if new_status != link.status:
        link = await payment_link_repository.update_link_status(db, link, new_status)
        if new_status == PaymentLinkStatus.paid:
            if not link.razorpay_payment_id:
                payments = remote.get("payments")
                if payments and isinstance(payments, list) and len(payments) > 0:
                    first_p = payments[0]
                    if isinstance(first_p, dict) and first_p.get("payment_id"):
                        link.razorpay_payment_id = first_p.get("payment_id")
                    elif isinstance(first_p, str):
                        link.razorpay_payment_id = first_p
                elif remote.get("payment_id"):
                    link.razorpay_payment_id = remote.get("payment_id")

            if link.order_id:
                order = await db.get(Order, link.order_id)
                if order:
                    order.status = OrderStatus.paid
                    order.paid_amount = link.amount
            if link.customer_id:
                conn_stmt = select(CustomerConnection).where(
                    CustomerConnection.merchant_id == merchant.id,
                    CustomerConnection.customer_id == link.customer_id,
                )
                conn_res = await db.execute(conn_stmt)
                conn = conn_res.scalar_one_or_none()
                if conn:
                    conn.total_spent = (conn.total_spent or Decimal("0.00")) + link.amount
        await db.commit()

    return link