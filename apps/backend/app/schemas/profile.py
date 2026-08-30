import uuid
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class AddressDTO(BaseModel):
    line1: str | None = Field(None, max_length=255)
    line2: str | None = Field(None, max_length=255)
    landmark: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    pincode: str | None = Field(None, max_length=20)
    country: str = Field("India", max_length=100)
    model_config = ConfigDict(from_attributes=True)

class ExpenseDTO(BaseModel):
    id: uuid.UUID | None = None
    category: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., ge=0)
    due_on: str = Field("1st of month", max_length=50)
    notes: str | None = Field(None, max_length=500)
    model_config = ConfigDict(from_attributes=True)

class AIInfoDTO(BaseModel):
    help_with: str = Field(..., min_length=1)
    rule: str | None = Field(None, max_length=2000)
    model_config = ConfigDict(from_attributes=True)

class MerchantProfileDTO(BaseModel):
    business_name: str | None = None
    business_type: str | None = None
    business_description: str | None = None
    gstin: str | None = None
    upi_vpa: str | None = None
    preferred_language: str = "English"
    is_razorpay_active: bool = False
    expenses: list[ExpenseDTO] = []
    model_config = ConfigDict(from_attributes=True)

class SettingsResponse(BaseModel):
    show_mobile_number: bool = True
    show_email: bool = False
    ai_info: AIInfoDTO | None = None
    model_config = ConfigDict(from_attributes=True)

class UpdateSettingsRequest(BaseModel):
    show_mobile_number: bool | None = None
    show_email: bool | None = None
    ai_info: AIInfoDTO | None = None

class ProfileResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    phone_number: str | None = None
    profile_picture: str | None = None
    role: str
    merchant_profile: MerchantProfileDTO | None = None
    address: AddressDTO | None = None
    settings: SettingsResponse | None = None
    model_config = ConfigDict(from_attributes=True)

class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    phone_number: str | None = Field(None, max_length=20)
    business_name: str | None = Field(None, min_length=1, max_length=255)
    business_type: str | None = Field(None, min_length=1, max_length=100)
    business_description: str | None = Field(None, max_length=500)
    gstin: str | None = Field(None, max_length=15)
    upi_vpa: str | None = Field(None, max_length=100)
    preferred_language: str | None = Field(None, max_length=20)
    address: AddressDTO | None = None

class AvatarResponse(BaseModel):
    avatar_url: str
    message: str = "Avatar updated successfully"
    model_config = ConfigDict(from_attributes=True)