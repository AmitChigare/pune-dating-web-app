from pydantic import BaseModel, Field, field_validator
from typing import Optional
import uuid
from datetime import date
from config.settings import settings

class ProfileBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50, pattern=r"^[A-Za-z\s\-]+$")
    last_name: Optional[str] = Field(None, max_length=50, pattern=r"^[A-Za-z\s\-]*$")
    bio: Optional[str] = Field(None, max_length=500)
    birth_date: date
    gender: str = Field(..., max_length=20)
    interested_in: str = Field(..., max_length=20)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone_number: Optional[str] = Field(None, max_length=15, pattern=r"^\+?[1-9]\d{1,14}$")

class ProfileCreate(ProfileBase):
    @field_validator('latitude', 'longitude')
    def validate_location(cls, v, info):
        if v is not None:
            if info.field_name == 'latitude' and not (settings.PUNE_LAT_MIN <= v <= settings.PUNE_LAT_MAX):
                raise ValueError("App only available in Pune")
            if info.field_name == 'longitude' and not (settings.PUNE_LONG_MIN <= v <= settings.PUNE_LONG_MAX):
                raise ValueError("App only available in Pune")
        return v

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50, pattern=r"^[A-Za-z\s\-]+$")
    last_name: Optional[str] = Field(None, max_length=50, pattern=r"^[A-Za-z\s\-]*$")
    bio: Optional[str] = Field(None, max_length=500)
    gender: Optional[str] = Field(None, max_length=20)
    interested_in: Optional[str] = Field(None, max_length=20)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone_number: Optional[str] = Field(None, max_length=15, pattern=r"^\+?[1-9]\d{1,14}$")

class ProfileResponse(ProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    photos: list["PhotoResponse"] = []

    class Config:
        from_attributes = True

from schemas.photo import PhotoResponse
ProfileResponse.model_rebuild()
