from dataclasses import dataclass
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status
from app.core.config import settings

_google_request = google_requests.Request()

@dataclass
class GoogleUserInfo:
    google_id: str
    email: str
    full_name: str
    picture: str | None

def verify_google_id_token(token: str) -> GoogleUserInfo:
    try:
        payload = id_token.verify_oauth2_token(
            token,
            _google_request,
            settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None,
            clock_skew_in_seconds=15,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Google authentication token: {str(e)}",
        )

    issuer = payload.get("iss")
    if issuer not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token issuer",
        )

    if not payload.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email is not verified",
        )

    return GoogleUserInfo(
        google_id=payload["sub"],
        email=payload["email"],
        full_name=payload.get("name", payload.get("email", "").split("@")[0]),
        picture=payload.get("picture"),
    )
