from sqlalchemy.ext.asyncio import AsyncSession
from app.models.usage_log import UsageLog
import uuid

async def log_usage(
    db: AsyncSession, 
    api_key_id: uuid.UUID, 
    provider: str, 
    model: str, 
    prompt_tokens: int, 
    completion_tokens: int, 
    total_cost: float, 
    latency_ms: int, 
    status: str
):
    log = UsageLog(
        api_key_id=api_key_id,
        provider=provider,
        model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_cost=total_cost,
        latency_ms=latency_ms,
        status=status
    )
    db.add(log)
    await db.commit()
