from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Global auth checks
        response = await call_next(request)
        return response
