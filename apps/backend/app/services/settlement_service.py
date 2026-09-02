import uuid
from decimal import Decimal
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.merchant_profile import MerchantProfile
from app.models.settlement import Settlement, SettlementStatus
from app.services.razorpay_client_factory import get_merchant_razorpay_client
from app.repositories import settlement_repository, audit_log_repository

async def sync_settlements_from_razorpay(
    db: AsyncSession,
    merchant: MerchantProfile,
    user_id: uuid.UUID,
    count: int = 30,
) -> int:
    client = get_merchant_razorpay_client(merchant)

    try:
        res = client.settlement.all({"count": count})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to sync settlements: {str(e)}")
    
    items = res.get("items", [])
    upserted_count = 0

    status_map = {
        "processed": SettlementStatus.processed,
        "created": SettlementStatus.pending,
        "failed": SettlementStatus.failed,
    }

    for item in items:
        rzp_id = item.get("id")
        if not rzp_id:
            continue
        
        raw_amount = Decimal(str(item.get("amount", 0))) / 100
        fee = Decimal(str(item.get("fees", 0))) / 100
        tax = Decimal(str(item.get("tax", 0))) / 100
        raw_status = item.get("status", "processed")
        settled_at_ts = item.get("created_at")

        settled_at = (
            datetime.fromtimestamp(settled_at_ts, tz=timezone.utc)
            if settled_at_ts
            else None
        )

        await settlement_repository.upsert_settlement(
            db=db,
            merchant_id=merchant.id,
            razorpay_settlement_id=rzp_id,
            amount=raw_amount,
            fee=fee,
            tax=tax,
            net_amount=raw_amount - fee - tax,
            currency=item.get("currency", "INR"),
            utr=item.get("utr"),
            method=item.get("method", "NEFT"),
            status=status_map.get(raw_status, SettlementStatus.processed),
            settled_at=settled_at,
        )
        upserted_count += 1

    await audit_log_repository.log_action(
        db=db,
        action="settlements.synced",
        entity_type="settlement",
        entity_id=str(merchant.id),
        merchant_id=merchant.id,
        user_id=user_id,
        details={"synced_count": upserted_count},
    )

    await db.commit()
    return upserted_count