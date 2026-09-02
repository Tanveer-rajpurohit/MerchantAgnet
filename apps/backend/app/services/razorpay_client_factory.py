import razorpay
from fastapi import HTTPException, status
from app.models.merchant_profile import MerchantProfile
from app.core.security_crypto import decrypt_credential

def get_merchant_razorpay_client(merchant: MerchantProfile) -> razorpay.Client:
    if not merchant.is_razorpay_active or not merchant.razorpay_key_id or not merchant.razorpay_key_secret_encrypted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Razorpay is not connected for this merchant. Please configure API keys in Settings.",
        )
    key_secret = decrypt_credential(merchant.razorpay_key_secret_encrypted)
    return razorpay.Client(auth=(merchant.razorpay_key_id, key_secret))