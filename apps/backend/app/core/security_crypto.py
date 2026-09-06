from cryptography.fernet import Fernet
from app.core.config import settings

FALLBACK_KEYS = [
    "KHpQvGJWi4tNeMUcW8S_f36pGIRx2ti1po2yHlOuF3s=",
    "AXuZ9j12k91823ks09HH128931kSH88k12893k199PP=",
]

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
    keys_to_try = [settings.CREDENTIALS_ENCRYPTION_KEY] + [
        k for k in FALLBACK_KEYS if k != settings.CREDENTIALS_ENCRYPTION_KEY
    ]
    for key in keys_to_try:
        try:
            f = Fernet(key.encode())
            return f.decrypt(cipher_text.encode("utf-8")).decode("utf-8")
        except Exception:
            continue
    raise ValueError("Failed to decrypt credential with any available encryption key")

def mask_key_id(key_id: str | None) -> str | None:
    if not key_id or len(key_id) < 12:
        return key_id
    prefix = "rzp_test_" if key_id.startswith("rzp_test_") else ("rzp_live_" if key_id.startswith("rzp_live_") else key_id[:8])
    return f"{prefix}••••••••{key_id[-4:]}"