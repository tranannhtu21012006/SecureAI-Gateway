import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.utils.database import Base

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    key_hash = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    rate_limit = Column(Integer, default=100, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    last_used_at = Column(DateTime, nullable=True)
