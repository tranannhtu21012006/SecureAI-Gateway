import hashlib
import json
import os
import logging
from typing import Optional, Dict, Any
import redis.asyncio as redis
from app.schemas.chat import ChatRequest

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def _generate_cache_key(request: ChatRequest) -> str:
    messages_str = json.dumps([m.model_dump() for m in request.messages])
    hash_input = f"{request.provider}:{request.model}:{messages_str}:{request.temperature}"
    key_hash = hashlib.sha256(hash_input.encode()).hexdigest()
    return f"cache:llm:{request.model}:{key_hash}"

async def get_cached_response(request: ChatRequest) -> Optional[Dict[str, Any]]:
    key = _generate_cache_key(request)
    try:
        cached = await redis_client.get(key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        logger.error(f"Redis cache get error: {e}")
    return None

async def cache_response(request: ChatRequest, response: dict, ttl: int = CACHE_TTL):
    key = _generate_cache_key(request)
    try:
        await redis_client.set(key, json.dumps(response), ex=ttl)
    except Exception as e:
        logger.error(f"Redis cache set error: {e}")
