from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
import time

from app.schemas.chat import ChatRequest, ChatResponse
from app.utils.database import get_db
from app.models.api_key import APIKey
from app.services.prompt_guard import scan_prompt
from app.services.cache_service import get_cached_response, cache_response
from app.middleware.rate_limiter import check_rate_limit
from app.services.llm_router import route_request
from app.services.usage_tracker import log_usage

router = APIRouter()

async def get_current_api_key(authorization: Optional[str] = Header(None), db: AsyncSession = Depends(get_db)) -> APIKey:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    token = authorization.split(" ")[1].strip()
    
    import hashlib
    import logging
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    result = await db.execute(select(APIKey).filter(APIKey.key_hash == token_hash))
    api_key = result.scalars().first()
    
    if not api_key:
        logging.error(f"API key not found for hash {token_hash}")
        raise HTTPException(status_code=401, detail="Invalid or inactive API key")
    if not api_key.is_active:
        logging.error("API key is inactive")
        raise HTTPException(status_code=401, detail="Invalid or inactive API key")
    
    return api_key

@router.post("/completions", response_model=ChatResponse)
async def chat_completions(request: ChatRequest, api_key: APIKey = Depends(get_current_api_key), db: AsyncSession = Depends(get_db)):
    start_time = time.time()
    
    # 1. Rate Limiting
    remaining = await check_rate_limit(str(api_key.id), api_key.rate_limit)
    
    # 2. Prompt Security Guard
    is_safe = await scan_prompt(request.messages)
    if not is_safe:
        latency_ms = int((time.time() - start_time) * 1000)
        await log_usage(db, api_key.id, request.provider or "unknown", request.model, 0, 0, 0.0, latency_ms, "blocked")
        raise HTTPException(status_code=400, detail="Blocked by prompt guard")
    
    # 3. Caching
    if not request.stream:
        cached = await get_cached_response(request)
        if cached:
            return ChatResponse(**cached)
    
    # 4. Route to LLM
    try:
        response = await route_request(request)
        
        if request.stream:
            # Streaming response not fully implemented with SSE yet, just basic structure
            # SPEC says response text/event-stream
            async def event_generator():
                async for chunk in response:
                    yield f"data: {chunk}\n\n"
                yield "data: [DONE]\n\n"
            return StreamingResponse(event_generator(), media_type="text/event-stream")
        else:
            if isinstance(response, ChatResponse):
                # Cache response
                await cache_response(request, response.model_dump())
                
                # Log usage
                latency_ms = int((time.time() - start_time) * 1000)
                usage = response.usage
                await log_usage(
                    db, 
                    api_key.id, 
                    request.provider or "unknown", 
                    request.model, 
                    usage.prompt_tokens if usage else 0, 
                    usage.completion_tokens if usage else 0, 
                    0.0, 
                    latency_ms, 
                    "success"
                )
                
                return response
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        await log_usage(db, api_key.id, request.provider or "unknown", request.model, 0, 0, 0.0, latency_ms, "error")
        raise HTTPException(status_code=500, detail=str(e))
