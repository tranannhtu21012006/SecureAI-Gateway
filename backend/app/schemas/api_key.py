from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional

class APIKeyCreate(BaseModel):
    name: str
    rate_limit: int = 100

class APIKeyResponse(BaseModel):
    id: UUID4
    name: str
    is_active: bool
    rate_limit: int
    created_at: datetime
    last_used_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class APIKeyCreateResponse(APIKeyResponse):
    plain_key: str # Only returned once on creation
