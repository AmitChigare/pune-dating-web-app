from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from config.database import get_db
from config.redis import get_redis_pool
from config.settings import settings
from schemas.user import UserCreate, UserResponse
from schemas.token import Token, RefreshTokenRequest, LogoutRequest
from services.user_service import UserService
from routes.dependencies import get_current_user, oauth2_scheme
from utils.security import verify_password, create_access_token, create_refresh_token
from jose import jwt, JWTError
from models.user import User, UserRole
import httpx

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    user_service = UserService(db)
    # create_user will hash password internally
    user = await user_service.create_user(user_in)
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user_service = UserService(db)
    user = await user_service.get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id, role=user.role.value)
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/google/callback", response_model=Token)
async def google_callback(request: __import__('schemas').user.GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    if not settings.SUPABASE_URL:
        raise HTTPException(status_code=500, detail="Supabase URL not configured on backend")
        
    auth_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            auth_url,
            headers={"Authorization": f"Bearer {request.access_token}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Supabase Session")
            
        user_data = response.json()
        
    email = user_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google authentication did not provide an email")
        
    user_service = UserService(db)
    user = await user_service.get_user_by_email(email)
    
    if not user:
        # Create user via OAuth automatically
        user = User(
            email=email,
            hashed_password="oauth_managed_no_password_required",
            is_active=True,
            is_verified=True,  # Google verifies emails
            role=UserRole.USER,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    elif not user.is_active:
        user.is_active = True
        await db.commit()
        
    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id, role=user.role.value)
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(request.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        jti: str = payload.get("jti")
        token_type: str = payload.get("type")
        
        if user_id is None or jti is None or token_type != "refresh":
            raise credentials_exception
            
        # Check if refresh token is blacklisted
        redis = await get_redis_pool()
        if await redis.get(f"bl:{jti}"):
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
        
    user_service = UserService(db)
    user = await user_service.get_user_by_id(uuid.UUID(user_id))
    if not user or not user.is_active:
        raise credentials_exception
        
    # Optional: Rotate the refresh token (blacklist old one and issue a new one)
    # await redis.setex(f"bl:{jti}", settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, "1")
    
    new_access_token = create_access_token(subject=user.id, role=user.role.value)
    new_refresh_token = create_refresh_token(subject=user.id, role=user.role.value)
    
    return {"access_token": new_access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    request: LogoutRequest, 
    token: str = Depends(oauth2_scheme), 
    current_user: User = Depends(get_current_user)
):
    try:
        redis = await get_redis_pool()
        
        # Blacklist Access Token
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            access_jti = payload.get("jti")
            if access_jti:
                # Store access JTI in blacklist until expiration
                ttl = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
                await redis.setex(f"bl:{access_jti}", ttl, "1")
        except JWTError:
            pass # Token already bad or expired
            
        # Blacklist Refresh Token if provided
        if request.refresh_token:
            try:
                refresh_payload = jwt.decode(request.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                refresh_jti = refresh_payload.get("jti")
                if refresh_jti:
                    # Store refresh JTI in blacklist until expiration
                    ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
                    await redis.setex(f"bl:{refresh_jti}", ttl, "1")
            except JWTError:
                pass

        return {"detail": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Action could not be completed securely")

