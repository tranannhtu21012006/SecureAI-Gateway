from sqlalchemy.ext.asyncio import AsyncSession
from app.models.usage_log import UsageLog
from app.metrics import (
    record_llm_request,
    record_llm_latency,
    record_llm_tokens,
    record_llm_cost,
)
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
    # 1. Update Prometheus real-time metrics
    record_llm_request(provider=provider, model=model, status=status)
    record_llm_latency(provider=provider, model=model, latency_ms=latency_ms)
    record_llm_tokens(provider=provider, model=model, prompt_tokens=prompt_tokens, completion_tokens=completion_tokens)
    if total_cost > 0:
        record_llm_cost(provider=provider, model=model, cost=total_cost)

    # 2. Persist to PostgreSQL database
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
