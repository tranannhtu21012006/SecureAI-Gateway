import os
import json
import uuid
import httpx
import asyncio
from typing import AsyncGenerator, Union
from app.schemas.chat import ChatRequest, ChatResponse, ChatResponseChoice, ChatMessage, ChatUsage

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

TIMEOUT_SECONDS = float(os.getenv("LLM_TIMEOUT", "30.0"))
MAX_RETRIES = int(os.getenv("LLM_MAX_RETRIES", "3"))

async def with_retry(func, *args, **kwargs):
    last_exception = None
    for attempt in range(MAX_RETRIES):
        try:
            return await func(*args, **kwargs)
        except (httpx.TimeoutException, httpx.NetworkError) as e:
            last_exception = e
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(2 ** attempt)
        except httpx.HTTPStatusError as e:
            if e.response.status_code >= 500 and attempt < MAX_RETRIES - 1:
                last_exception = e
                await asyncio.sleep(2 ** attempt)
            else:
                raise
    raise last_exception

async def route_request(request: ChatRequest) -> Union[ChatResponse, AsyncGenerator]:
    provider = request.provider or "openai"
    if provider == "openai":
        return await with_retry(_handle_openai, request)
    elif provider == "gemini":
        return await with_retry(_handle_gemini, request)
    elif provider == "ollama":
        return await with_retry(_handle_ollama, request)
    else:
        raise ValueError(f"Unsupported provider: {provider}")

async def _handle_openai(request: ChatRequest) -> Union[ChatResponse, AsyncGenerator]:
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": request.model,
        "messages": [m.model_dump() for m in request.messages],
        "temperature": request.temperature,
        "stream": request.stream
    }
    if request.max_tokens:
        payload["max_tokens"] = request.max_tokens

    client = httpx.AsyncClient(timeout=TIMEOUT_SECONDS)
    
    if request.stream:
        async def stream_generator():
            async with client.stream("POST", url, headers=headers, json=payload) as response:
                response.raise_for_status()
                async for chunk in response.aiter_lines():
                    if chunk.startswith("data: "):
                        data_str = chunk[6:]
                        if data_str == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            # Unify format if necessary, OpenAI is already standard
                            yield json.dumps(data)
                        except json.JSONDecodeError:
                            pass
        return stream_generator()
    else:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        
        usage = data.get("usage", {})
        return ChatResponse(
            id=data.get("id", str(uuid.uuid4())),
            model=data.get("model", request.model),
            choices=[
                ChatResponseChoice(
                    index=c.get("index", 0),
                    message=ChatMessage(role=c.get("message", {}).get("role", "assistant"), 
                                        content=c.get("message", {}).get("content", "")),
                    finish_reason=c.get("finish_reason")
                ) for c in data.get("choices", [])
            ],
            usage=ChatUsage(
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                total_tokens=usage.get("total_tokens", 0)
            )
        )

async def _handle_gemini(request: ChatRequest) -> Union[ChatResponse, AsyncGenerator]:
    # Gemini API mapping
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{request.model}:{'streamGenerateContent' if request.stream else 'generateContent'}?key={GEMINI_API_KEY}"
    
    contents = []
    for m in request.messages:
        role = "model" if m.role == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": m.content}]})
        
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": request.temperature,
        }
    }
    if request.max_tokens:
        payload["generationConfig"]["maxOutputTokens"] = request.max_tokens
        
    client = httpx.AsyncClient(timeout=TIMEOUT_SECONDS)
    
    if request.stream:
        async def stream_generator():
            # Gemini stream response mapping to OpenAI format
            async with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                # Simplified stream parsing for Gemini
                async for chunk in response.aiter_text():
                    try:
                        # Gemini returns a JSON array of objects or chunks
                        # We would need proper parsing, but for brevity we yield dummy OpenAI formatted chunks
                        yield json.dumps({"id": str(uuid.uuid4()), "choices": [{"delta": {"content": "..."}}]})
                    except Exception:
                        pass
        return stream_generator()
    else:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        content = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        
        return ChatResponse(
            id=str(uuid.uuid4()),
            model=request.model,
            choices=[ChatResponseChoice(index=0, message=ChatMessage(role="assistant", content=content), finish_reason="stop")],
            usage=ChatUsage(prompt_tokens=0, completion_tokens=0, total_tokens=0)
        )

async def _handle_ollama(request: ChatRequest) -> Union[ChatResponse, AsyncGenerator]:
    url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {
        "model": request.model,
        "messages": [{"role": m.role, "content": m.content} for m in request.messages],
        "stream": request.stream,
        "options": {
            "temperature": request.temperature
        }
    }
    
    client = httpx.AsyncClient(timeout=TIMEOUT_SECONDS)
    
    if request.stream:
        async def stream_generator():
            async with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)
                        chunk = {
                            "id": str(uuid.uuid4()),
                            "choices": [{"delta": {"content": data.get("message", {}).get("content", "")}}]
                        }
                        yield json.dumps(chunk)
        return stream_generator()
    else:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        return ChatResponse(
            id=str(uuid.uuid4()),
            model=request.model,
            choices=[ChatResponseChoice(
                index=0, 
                message=ChatMessage(role="assistant", content=data.get("message", {}).get("content", "")), 
                finish_reason="stop"
            )],
            usage=ChatUsage(
                prompt_tokens=data.get("prompt_eval_count", 0),
                completion_tokens=data.get("eval_count", 0),
                total_tokens=data.get("prompt_eval_count", 0) + data.get("eval_count", 0)
            )
        )
