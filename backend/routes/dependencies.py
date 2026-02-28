from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError
import uuid

from config.settings import settings
from config.database import get_db
from config.redis import get_redis_pool
from models.user import User, UserRole
from services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        jti: str = payload.get("jti")
        
        if user_id is None or jti is None:
            raise credentials_exception
            
        # Check if token is blacklisted in Redis
        try:
            redis = await get_redis_pool()
            is_blacklisted = await redis.get(f"bl:{jti}")
            if is_blacklisted:
                raise HTTPException(status_code=401, detail="Token has been revoked")
        except Exception as e:
            # If redis fails, log it but don't fail authentication entirely (fail-open for resilience, or fail-closed based on security posture)
            print(f"Redis blacklist check failed: {e}")

        token_type: str = payload.get("type")
        if token_type != "access":
            raise HTTPException(status_code=400, detail="Invalid token type")
    except JWTError:
        raise credentials_exception
    
    user_service = UserService(db)
    user = await user_service.get_user_by_id(uuid.UUID(user_id))
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user
