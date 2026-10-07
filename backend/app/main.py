from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import auth, analytics, admin
from app.routers.chat import router as chat_router
from app.middleware.logging_middleware import LoggingMiddleware
from app.utils.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="SecureAI Gateway",
    description="AI API Gateway for managing, securing, and optimizing LLM API calls",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)


@app.get("/health")
async def health_check():
    """Health check endpoint for K8s probes."""
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
