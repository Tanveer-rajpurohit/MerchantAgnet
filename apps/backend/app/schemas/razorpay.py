from datetime import datetime
from pydantic import BaseModel, Field

class RazorpayConnectRequest(BaseModel):
    key_id: str = Field(min_length=8, max_length=100)
    key_secret: str = Field(min_length=8, max_length=100)

class RazorpayStatusResponse(BaseModel):
    is_connected: bool
    mode: str
    key_id_masked: str | None
    connected_at: datetime | None