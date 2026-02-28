from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from models.user import User
from routes.dependencies import get_current_user
from schemas.user import UserResponse, UserAccountUpdate
from schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from services.user_service import UserService

router = APIRouter()

@router.get("/discover", response_model=list[ProfileResponse])
async def discover_users(
    min_age: int = 18,
    max_age: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from fastapi import HTTPException
    user_service = UserService(db)
    my_profile = await user_service.get_profile(current_user.id)
    if not my_profile:
        raise HTTPException(status_code=400, detail="Profile required to discover users")
        
    profiles = await user_service.get_discover_feed(
        current_user_id=current_user.id,
        user_gender=my_profile.gender,
        interested_in=my_profile.interested_in,
        min_age=min_age,
        max_age=max_age,
        user_latitude=getattr(my_profile, "latitude", None),
        user_longitude=getattr(my_profile, "longitude", None),
    )
    return profiles

@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me/account", response_model=UserResponse)
async def update_account_details(
    update_data: UserAccountUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_service = UserService(db)
    return await user_service.update_account(current_user.id, update_data)

@router.delete("/me/deactivate", response_model=UserResponse)
async def deactivate_my_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_service = UserService(db)
    return await user_service.deactivate_user(current_user.id)

@router.get("/me/profile", response_model=ProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from fastapi import HTTPException
    user_service = UserService(db)
    profile = await user_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/me/profile", response_model=ProfileResponse)
async def create_my_profile(
    profile_in: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_service = UserService(db)
    profile = await user_service.create_profile(current_user.id, profile_in)
    return profile

@router.put("/me/profile", response_model=ProfileResponse)
async def update_my_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_service = UserService(db)
    profile = await user_service.update_profile(current_user.id, profile_in)
    return profile
