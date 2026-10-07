from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID4
    role: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
