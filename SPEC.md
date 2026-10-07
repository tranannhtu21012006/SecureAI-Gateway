# SecureAI Gateway - Technical Specification

This document is the single source of truth for the SecureAI Gateway platform. It defines the schemas, API contracts, interfaces, and exact file assignments for three coding agents working in parallel.

## 1. Database Schema (PostgreSQL)
We use SQLAlchemy 2.0 async.

### `users` table
- `id`: UUID (Primary Key, default: `uuid4`)
- `email`: VARCHAR(255) (Unique, Index, Not Null)
- `hashed_password`: VARCHAR(255) (Not Null)
- `role`: VARCHAR(50) (Default: 'user', Not Null - values: 'admin', 'user')
- `created_at`: TIMESTAMP (Default: `func.now()`, Not Null)
- `updated_at`: TIMESTAMP (Default: `func.now()`, onupdate: `func.now()`, Not Null)

### `api_keys` table
- `id`: UUID (Primary Key, default: `uuid4`)
- `user_id`: UUID (Foreign Key to `users.id`, Index, Not Null)
- `key_hash`: VARCHAR(255) (Unique, Index, Not Null)
- `name`: VARCHAR(255) (Not Null)
- `is_active`: BOOLEAN (Default: True, Not Null)
- `rate_limit`: INTEGER (Tokens/min, Default: 100, Not Null)
- `created_at`: TIMESTAMP (Default: `func.now()`, Not Null)
- `last_used_at`: TIMESTAMP (Nullable)

### `usage_logs` table
- `id`: UUID (Primary Key, default: `uuid4`)
- `api_key_id`: UUID (Foreign Key to `api_keys.id`, Index, Not Null)
- `provider`: VARCHAR(100) (Not Null)
- `model`: VARCHAR(100) (Not Null)
- `prompt_tokens`: INTEGER (Not Null)
- `completion_tokens`: INTEGER (Not Null)
- `total_cost`: FLOAT (Not Null, Default: 0.0)
- `latency_ms`: INTEGER (Not Null)
- `status`: VARCHAR(50) (Not Null - values: 'success', 'error', 'blocked')
- `created_at`: TIMESTAMP (Default: `func.now()`, Index, Not Null)

## 2. Shared Pydantic Schemas

**`backend/app/schemas/user.py` (Agent 2)**
```python
from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID4
    role: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

**`backend/app/schemas/api_key.py` (Agent 2)**
```python
from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional

class APIKeyCreate(BaseModel):
    name: str
    rate_limit: int = 100

class APIKeyResponse(BaseModel):
    id: UUID4
    name: str
    is_active: bool
    rate_limit: int
    created_at: datetime
    last_used_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class APIKeyCreateResponse(APIKeyResponse):
    plain_key: str # Only returned once on creation
```

**`backend/app/schemas/chat.py` (Agent 3)**
```python
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    stream: bool = False
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None
    provider: Optional[str] = "openai" # "openai", "gemini", "ollama"

class ChatResponseChoice(BaseModel):
    index: int
    message: ChatMessage
    finish_reason: Optional[str]

class ChatUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatResponse(BaseModel):
    id: str
    model: str
    choices: List[ChatResponseChoice]
    usage: Optional[ChatUsage]
```

## 3. API Contracts

### Auth Routes (`/api/v1/auth/`)
- `POST /register`: Request `UserCreate`, Response `UserResponse`
- `POST /login`: Request `OAuth2PasswordRequestForm` (Form data), Response `{ "access_token": str, "token_type": "bearer" }`
- `POST /api-keys`: Request `APIKeyCreate`, Response `APIKeyCreateResponse`. Requires authenticated user.
- `GET /api-keys`: Request None, Response `List[APIKeyResponse]`. Requires authenticated user.
- `DELETE /api-keys/{key_id}`: Request None, Response `{ "status": "success" }`. Requires authenticated user.

### Chat Routes (`/api/v1/chat/`)
- `POST /completions`: Request `ChatRequest`, Response `ChatResponse`. Header: `Authorization: Bearer <API_KEY>`.
- `POST /completions/stream`: Request `ChatRequest` (with `stream=True`), Response `text/event-stream` returning OpenAI compatible SSE chunks. Header: `Authorization: Bearer <API_KEY>`.

### Analytics Routes (`/api/v1/analytics/`)
- `GET /usage`: Query params `start_date`, `end_date`, Response `List[UsageLogResponse]`. Requires authenticated user.
- `GET /usage/summary`: Query params `start_date`, `end_date`, Response `{ "total_cost": float, "total_requests": int, "avg_latency_ms": float }`. Requires authenticated user.

### Admin Routes (`/api/v1/admin/`)
- `GET /users`: Response `List[UserResponse]`. Requires admin user.
- `PUT /users/{user_id}/role`: Request `{ "role": str }`, Response `UserResponse`. Requires admin user.

## 4. Interface Contracts Between Components

### LLM Router (`backend/app/services/llm_router.py`)
- Defines `async def route_request(request: ChatRequest) -> ChatResponse | AsyncGenerator`
- Dispatches to provider-specific clients based on `request.provider`.

### Caching (`backend/app/services/cache_service.py`)
- Redis Keys: `cache:llm:{model_name}:{request_hash}`
- Stores full JSON `ChatResponse`.
- Defines `async def get_cached_response(request: ChatRequest)` and `async def cache_response(request: ChatRequest, response: dict)`

### Rate Limiting (`backend/app/middleware/rate_limiter.py`)
- Redis Keys: `ratelimit:{api_key_id}`
- Token bucket logic: Check user's `rate_limit` before fulfilling request. Throw HTTP 429 if exceeded.

### Prompt Security (`backend/app/services/prompt_guard.py`)
- Defines `async def scan_prompt(messages: List[ChatMessage]) -> bool`
- Throws HTTP 400 with "Blocked by prompt guard" if malicious.

### Database Dependency (`backend/app/utils/database.py`)
- Defines `async def get_db() -> AsyncSession` for FastAPI `Depends()`.

## 5. Configuration & Environment Variables
**`.env` defaults for local dev:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/secureai
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=supersecretkey-change-in-prod
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
OLLAMA_BASE_URL=http://localhost:11434
ENVIRONMENT=development
```

## 6. Task Assignment (CRITICAL - No Overlapping Files)

**Agent 2 (Backend Core) files - ONLY these:**
- `backend/app/main.py`
- `backend/app/config.py`
- `backend/app/models/__init__.py`, `user.py`, `api_key.py`, `usage_log.py`
- `backend/app/schemas/__init__.py`, `auth.py`, `analytics.py`, `user.py`, `api_key.py`
- `backend/app/routers/__init__.py`, `auth.py`, `analytics.py`, `admin.py`
- `backend/app/utils/__init__.py`, `security.py`, `database.py`
- `backend/app/middleware/__init__.py`, `auth_middleware.py`, `logging_middleware.py`
- `backend/requirements.txt`
- `backend/alembic.ini`, `backend/alembic/`
- `backend/app/__init__.py`

**Agent 3 (LLM & Security) files - ONLY these:**
- `backend/app/schemas/chat.py`
- `backend/app/routers/chat.py`
- `backend/app/services/__init__.py`, `llm_router.py`, `prompt_guard.py`, `cache_service.py`, `usage_tracker.py`
- `backend/app/middleware/rate_limiter.py`
- `backend/tests/` (all test files)

**Agent 4 (Frontend & Infra) files - ONLY these:**
- `frontend/` (entire directory)
- `k8s/` (entire directory)
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `Makefile`
- `setup-k3d.sh`
- `README.md`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `.env.example`

## 7. Important Integration Points
- Agent 2's `backend/app/main.py` must include routers from both agents exactly like this:
  ```python
  from fastapi import FastAPI
  from app.routers import auth, analytics, admin
  from app.routers.chat import router as chat_router

  app = FastAPI()

  app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
  app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
  app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
  app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
  ```
- Agent 3's `chat` router must use `from app.utils.database import get_db` for database sessions.
- Agent 3 must create `router = APIRouter()` in `backend/app/routers/chat.py`.
- Authentication in Agent 3's `chat.py` must rely on Agent 2's API Key mechanisms (validating Bearer token from header against the `api_keys` table using a dependency `get_current_api_key`).
