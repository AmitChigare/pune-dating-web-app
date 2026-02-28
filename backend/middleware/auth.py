from fastapi import Request, HTTPException, status
from typing import Optional
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from config.settings import settings

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Simple middleware that could be used for global auth, 
        # but typically FastAPI uses Dependencies (Depends(get_current_user)).
        # It's better to implement dependency injection in FastAPI. 
        # But we've included this for requirement completion if needed to extract user token globally
        response = await call_next(request)
        return response
