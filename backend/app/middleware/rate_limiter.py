import os
import time
import logging
from fastapi import HTTPException
import redis.asyncio as redis

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

async def check_rate_limit(api_key_id: str, rate_limit: int):
    """
    Token bucket rate limiting logic using Redis sorted sets (or simple decrement).
    Since we need a simple token bucket:
    We'll store tokens and last_refill.
    """
    key = f"ratelimit:{api_key_id}"
    current_time = time.time()
    
    try:
        # A simple implementation of token bucket using lua script
        lua_script = """
        local key = KEYS[1]
        local limit = tonumber(ARGV[1])
        local current_time = tonumber(ARGV[2])
        local refill_rate = limit / 60.0 -- tokens per second (assuming limit is per minute)
        
        local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
        local tokens = tonumber(bucket[1])
        local last_refill = tonumber(bucket[2])
        
        if not tokens then
            tokens = limit
            last_refill = current_time
        else
            local time_passed = current_time - last_refill
            tokens = tokens + (time_passed * refill_rate)
            if tokens > limit then
                tokens = limit
            end
        end
        
        if tokens >= 1 then
            tokens = tokens - 1
            redis.call('HMSET', key, 'tokens', tokens, 'last_refill', current_time)
            redis.call('EXPIRE', key, 120)
            return tokens
        else
            return -1
        end
        """
        
        result = await redis_client.eval(lua_script, 1, key, rate_limit, current_time)
        
        if result == -1:
            raise HTTPException(
                status_code=429, 
                detail="Rate limit exceeded",
                headers={
                    "X-RateLimit-Limit": str(rate_limit),
                    "X-RateLimit-Remaining": "0"
                }
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Redis rate limiting error: {e}. Bypassing rate limit.")
        return rate_limit # Bypass on Redis failure
