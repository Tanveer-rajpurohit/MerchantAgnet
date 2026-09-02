import razorpay
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.core.security_crypto import encrypt_credential, mask_key_id
from app.schemas.razorpay import RazorpayConnectRequest, RazorpayStatusResponse

router = APIRouter(prefix="/merchants/razorpay", tags=["Merchant Razorpay"])

def _probe_razorpay_credentials(key_id: str, key_secret: str) -> str:
    try:
        client = razorpay.Client(auth=(key_id.strip(), key_secret.strip()))
        client.payment_link.all({"count": 1})
        return "test" if key_id.strip().startswith("rzp_test_") else "live"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Razorpay Key ID or Secret. Please verify keys in your Razorpay Dashboard.",
        ) from e


@router.post("/verify")
async def verify_credentials(
    payload: RazorpayConnectRequest,
    current_user: User = Depends(get_current_user),
):
    mode = _probe_razorpay_credentials(payload.key_id, payload.key_secret)
    return {"valid": True, "mode": mode}

@router.post("/connect", response_model=RazorpayStatusResponse)
async def connect_razorpay(
    payload: RazorpayConnectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.merchant or not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Merchant profile required")
    key_id = payload.key_id.strip()
    key_secret = payload.key_secret.strip()
    mode = _probe_razorpay_credentials(key_id, key_secret)

    profile = current_user.merchant_profile
    profile.razorpay_key_id = key_id
    profile.razorpay_key_secret_encrypted = encrypt_credential(key_secret)
    profile.is_razorpay_active = True
    profile.razorpay_mode = mode
    now = datetime.now(timezone.utc)
    profile.razorpay_connected_at = now

    audit = AuditLog(
        merchant_id=profile.id,
        user_id=current_user.id,
        action="merchant.razorpay_connected",
        entity_type="merchant_profile",
        entity_id=str(profile.id),
        details={"mode": mode, "key_id_masked": mask_key_id(key_id)},
    )
    db.add(audit)
    await db.commit()

    return RazorpayStatusResponse(
        is_connected=True,
        mode=mode,
        key_id_masked=mask_key_id(key_id),
        connected_at=now,
    )

@router.post("/disconnect", response_model=RazorpayStatusResponse)
async def disconnect_razorpay(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    profile.is_razorpay_active = False
    profile.razorpay_key_id = None
    profile.razorpay_key_secret_encrypted = None
    profile.razorpay_connected_at = None

    audit = AuditLog(
        merchant_id=profile.id,
        user_id=current_user.id,
        action="merchant.razorpay_disconnected",
        entity_type="merchant_profile",
        entity_id=str(profile.id),
        details={},
    )
    db.add(audit)
    await db.commit()

    return RazorpayStatusResponse(
        is_connected=False,
        mode="test",
        key_id_masked=None,
        connected_at=None,
    )

@router.get("/status", response_model=RazorpayStatusResponse)
async def get_razorpay_status(
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile or not profile.is_razorpay_active:
        return RazorpayStatusResponse(
            is_connected=False,
            mode="test",
            key_id_masked=None,
            connected_at=None,
        )
    return RazorpayStatusResponse(
        is_connected=True,
        mode=profile.razorpay_mode,
        key_id_masked=mask_key_id(profile.razorpay_key_id),
        connected_at=profile.razorpay_connected_at,
    )