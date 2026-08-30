from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class OnboardingStepResponse(BaseModel):
    step: str
    status: str
    count: int | None = None
    model_config = ConfigDict(from_attributes=True)

class OnboardingProfileRequest(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=255)
    business_type: str = Field(..., min_length=1, max_length=100)
    business_description: str | None = Field(None, max_length=500)
    city: str = Field(..., min_length=1, max_length=100)
    preferred_language: str = Field("English", max_length=20)
    owner_name: str | None = Field(None, max_length=255)

class OnboardingExpenseRow(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., ge=0)
    due_on: str = Field("1st of month", max_length=50)
    notes: str | None = Field(None, max_length=500)

class OnboardingExpensesRequest(BaseModel):
    expenses: list[OnboardingExpenseRow] = []

class OnboardingProductRow(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=255)
    cost_price: Decimal = Field(..., ge=0)
    selling_price: Decimal = Field(..., ge=0)
    current_stock: int = Field(0, ge=0)
    low_stock_alert: int = Field(5, ge=0)

class OnboardingProductsRequest(BaseModel):
    products: list[OnboardingProductRow] = []
    skip_inventory: bool = False

class OnboardingCompleteRequest(BaseModel):
    selected_goals: list[str] = []
    other_goal_text: str | None = Field(None, max_length=255)
    additional_details: str | None = Field(None, max_length=2000)
