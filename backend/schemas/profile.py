from pydantic import BaseModel, Field, field_validator
from typing import Optional
import uuid
from datetime import date
from config.settings import settings

class ProfileBase(BaseModel):
    first_name: str = Field(..., max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = None
    birth_date: date
    gender: str
    interested_in: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone_number: Optional[str] = None

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
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = None
    gender: Optional[str] = None
    interested_in: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone_number: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    photos: list["PhotoResponse"] = []

    class Config:
        from_attributes = True

from schemas.photo import PhotoResponse
ProfileResponse.model_rebuild()
