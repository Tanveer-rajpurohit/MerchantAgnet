import uuid
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class AddressDTO(BaseModel):
    line1: str | None = None
    line2: str | None = None
    landmark: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str = "India"
    model_config = ConfigDict(from_attributes=True)

class ExpenseDTO(BaseModel):
    id: uuid.UUID | None = None
    category: str
    amount: Decimal
    due_on: str = "1st of month"
    notes: str | None = None
    model_config = ConfigDict(from_attributes=True)

class AIInfoDTO(BaseModel):
    help_with: str
    rule: str | None = None
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
    full_name: str | None = None
    phone_number: str | None = None
    business_name: str | None = None
    business_type: str | None = None
    business_description: str | None = None
    gstin: str | None = None
    upi_vpa: str | None = None
    preferred_language: str | None = None
    address: AddressDTO | None = None

class AvatarResponse(BaseModel):
    avatar_url: str
    message: str = "Avatar updated successfully"
    model_config = ConfigDict(from_attributes=True)