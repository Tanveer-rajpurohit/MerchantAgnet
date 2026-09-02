from cryptography.fernet import Fernet
from app.core.config import settings

def _get_fernet() -> Fernet:
    return Fernet(settings.CREDENTIALS_ENCRYPTION_KEY.encode())

def encrypt_credential(plain_text: str) -> str:
    if not plain_text:
        return ""
    f = _get_fernet()
    return f.encrypt(plain_text.encode("utf-8")).decode("utf-8")

def decrypt_credential(cipher_text: str) -> str:
    if not cipher_text:
        return ""
    f = _get_fernet()
    return f.decrypt(cipher_text.encode("utf-8")).decode("utf-8")

def mask_key_id(key_id: str | None) -> str | None:
    if not key_id or len(key_id) < 12:
        return key_id
    prefix = "rzp_test_" if key_id.startswith("rzp_test_") else ("rzp_live_" if key_id.startswith("rzp_live_") else key_id[:8])
    return f"{prefix}••••••••{key_id[-4:]}"