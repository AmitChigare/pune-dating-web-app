from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid
from datetime import datetime, date
from models.user import UserRole

class UserStreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_active_date: Optional[date] = None
    badges: list[str] = []

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(max_length=64)

class GoogleAuthRequest(BaseModel):
    access_token: str

class UserAccountUpdate(BaseModel):
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    is_active: bool
    is_verified: bool
    role: UserRole
    created_at: datetime
    updated_at: datetime
    streak: Optional[UserStreakResponse] = None

    class Config:
        from_attributes = True
