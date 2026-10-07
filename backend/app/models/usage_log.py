import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.utils.database import Base

class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id"), index=True, nullable=False)
    provider = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    prompt_tokens = Column(Integer, nullable=False)
    completion_tokens = Column(Integer, nullable=False)
    total_cost = Column(Float, default=0.0, nullable=False)
    latency_ms = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=func.now(), index=True, nullable=False)
