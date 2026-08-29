import uuid
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.user import UserRole

class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.customer

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    id_token: str
    role: UserRole = UserRole.customer

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class AuthTokensResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class MessageResponse(BaseModel):
    message: str

class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    phone_number: str | None = None
    full_name: str
    role: UserRole
    profile_picture: str | None = None
    is_active: bool
    is_phone_verified: bool

    model_config = ConfigDict(from_attributes=True)