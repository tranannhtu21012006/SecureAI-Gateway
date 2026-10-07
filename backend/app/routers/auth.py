from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid
import secrets
import hashlib

from app.utils.database import get_db
from app.utils.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.models.api_key import APIKey
from app.schemas.user import UserCreate, UserResponse
from app.schemas.api_key import APIKeyCreate, APIKeyResponse, APIKeyCreateResponse
from app.schemas.auth import Token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/api-keys", response_model=APIKeyCreateResponse)
async def create_api_key(
    key_in: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plain_key = f"sk-{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(plain_key.encode()).hexdigest()
    
    db_key = APIKey(
        user_id=current_user.id,
        key_hash=key_hash,
        name=key_in.name,
        rate_limit=key_in.rate_limit
    )
    db.add(db_key)
    await db.commit()
    await db.refresh(db_key)
    
    return APIKeyCreateResponse(
        id=db_key.id,
        name=db_key.name,
        is_active=db_key.is_active,
        rate_limit=db_key.rate_limit,
        created_at=db_key.created_at,
        last_used_at=db_key.last_used_at,
        plain_key=plain_key
    )

@router.get("/api-keys", response_model=List[APIKeyResponse])
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(APIKey).filter(APIKey.user_id == current_user.id))
    return result.scalars().all()

@router.delete("/api-keys/{key_id}")
async def delete_api_key(
    key_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(APIKey).filter(APIKey.id == key_id, APIKey.user_id == current_user.id)
    )
    db_key = result.scalars().first()
    if not db_key:
        raise HTTPException(status_code=404, detail="API Key not found")
    
    await db.delete(db_key)
    await db.commit()
    return {"status": "success"}
