import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class ExpenseCreateRequest(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., ge=0)
    due_on: str = Field("1st of month", max_length=50)
    notes: str | None = Field(None, max_length=500)

class ExpenseUpdateRequest(BaseModel):
    category: str | None = Field(None, min_length=1, max_length=100)
    amount: Decimal | None = Field(None, ge=0)
    due_on: str | None = Field(None, max_length=50)
    notes: str | None = Field(None, max_length=500)

class ExpenseBatchRequest(BaseModel):
    expenses: list[ExpenseCreateRequest] = []

class ExpenseResponse(BaseModel):
    id: uuid.UUID
    category: str
    amount: Decimal
    due_on: str
    notes: str | None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
