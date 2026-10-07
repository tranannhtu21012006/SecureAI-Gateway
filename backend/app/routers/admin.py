from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid
from pydantic import BaseModel

from app.utils.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

class RoleUpdate(BaseModel):
    role: str

router = APIRouter()

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: uuid.UUID,
    role_update: RoleUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role_update.role
    await db.commit()
    await db.refresh(user)
    return user
