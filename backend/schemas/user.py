from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid
from datetime import datetime
from models.user import UserRole

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

    class Config:
        from_attributes = True
