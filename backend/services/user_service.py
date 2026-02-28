from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
import uuid

from models.user import User, UserRole
from models.profile import Profile
from schemas.user import UserCreate, UserAccountUpdate
from schemas.profile import ProfileCreate, ProfileUpdate
from utils.security import get_password_hash

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_user_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def create_user(self, user_in: UserCreate) -> User:
        user = await self.get_user_by_email(user_in.email)
        if user:
            if not user.is_active:
                # Reactivation Flow!
                user.is_active = True
                user.hashed_password = get_password_hash(user_in.password)
                await self.db.commit()
                await self.db.refresh(user)
                return user
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            is_active=True,
            is_verified=True,
            role=UserRole.USER,
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def update_account(self, user_id: uuid.UUID, update_data: UserAccountUpdate) -> User:
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if update_data.email:
            existing = await self.get_user_by_email(update_data.email)
            if existing and existing.id != user_id:
                raise HTTPException(status_code=400, detail="Email already taken")
            user.email = update_data.email
            
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def deactivate_user(self, user_id: uuid.UUID) -> User:
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.is_active = False
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def create_profile(self, user_id: uuid.UUID, profile_in: ProfileCreate) -> Profile:
        result = await self.db.execute(select(Profile).where(Profile.user_id == user_id))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profile already exists",
            )
            
        db_profile = Profile(
            user_id=user_id,
            first_name=profile_in.first_name,
            last_name=profile_in.last_name,
            bio=profile_in.bio,
            birth_date=profile_in.birth_date,
            gender=profile_in.gender,
            interested_in=profile_in.interested_in,
            latitude=profile_in.latitude,
            longitude=profile_in.longitude
        )
        self.db.add(db_profile)
        await self.db.commit()
        await self.db.refresh(db_profile)
        return db_profile

    async def get_profile(self, user_id: uuid.UUID) -> Profile | None:
        from sqlalchemy.orm import selectinload
        result = await self.db.execute(
            select(Profile)
            .join(User, Profile.user_id == User.id)
            .options(selectinload(Profile.user).selectinload(User.photos))
            .where(Profile.user_id == user_id)
        )
        profile = result.scalars().first()
        if profile:
            setattr(profile, 'photos', getattr(profile.user, 'photos', []))
        return profile

    async def update_profile(self, user_id: uuid.UUID, profile_update: ProfileUpdate) -> Profile:
        result = await self.db.execute(select(Profile).where(Profile.user_id == user_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        update_data = profile_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)
            
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def get_discover_feed(
        self,
        current_user_id: uuid.UUID,
        user_gender: str,
        interested_in: str,
        min_age: int = 18,
        max_age: int = 100,
        limit: int = 20,
        user_latitude: float | None = None,
        user_longitude: float | None = None,
    ):
        from datetime import datetime, date
        from sqlalchemy import and_, or_, not_
        from sqlalchemy.orm import selectinload
        from models.like import Like
        from models.block import Block
        
        current_year = datetime.now().year
        min_birth_date = date(current_year - max_age, 1, 1)
        max_birth_date = date(current_year - min_age, 12, 31)
        
        liked_subq = select(Like.to_user_id).where(Like.from_user_id == current_user_id)
        blocked_subq = select(Block.blocked_id).where(Block.blocker_id == current_user_id)
        blocker_subq = select(Block.blocker_id).where(Block.blocked_id == current_user_id)
        
        query = (
            select(Profile)
            .join(User, Profile.user_id == User.id)
            .options(selectinload(Profile.user).selectinload(User.photos))
            .where(
                and_(
                    Profile.user_id != current_user_id,
                    User.is_active == True,
                    User.is_shadowbanned == False,
                    Profile.birth_date.between(min_birth_date, max_birth_date),
                    Profile.user_id.not_in(liked_subq),
                    Profile.user_id.not_in(blocked_subq),
                    Profile.user_id.not_in(blocker_subq)
                )
            )
        )
        
        # Filter 1: The candidate matches what the current user is looking for
        if interested_in != "Everyone":
            query = query.where(Profile.gender == interested_in)

        # Filter 2: The candidate is looking for people like the current user
        query = query.where(
            or_(
                Profile.interested_in == user_gender,
                Profile.interested_in == "Everyone"
            )
        )

        # If we know the current user's location, sort candidates by nearest first
        if user_latitude is not None and user_longitude is not None:
            distance_expr = (
                (Profile.latitude - user_latitude) * (Profile.latitude - user_latitude)
                + (Profile.longitude - user_longitude) * (Profile.longitude - user_longitude)
            )
            query = query.where(
                Profile.latitude.is_not(None),
                Profile.longitude.is_not(None),
            ).order_by(distance_expr.asc())
            
        query = query.limit(limit)
        result = await self.db.execute(query)
        profiles = result.scalars().all()
        
        # Hydrate the photos property from the loaded user relationship 
        # so the Pydantic ProfileResponse can serialize it correctly
        for profile in profiles:
            setattr(profile, 'photos', getattr(profile.user, 'photos', []))
            
        return profiles
