from pydantic import BaseModel, UUID4
from datetime import datetime

class UsageLogResponse(BaseModel):
    id: UUID4
    api_key_id: UUID4
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_cost: float
    latency_ms: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UsageSummary(BaseModel):
    total_cost: float
    total_requests: int
    avg_latency_ms: float
