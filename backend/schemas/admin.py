from pydantic import BaseModel
import uuid
from typing import Optional, Generic, TypeVar, List
from datetime import datetime
from models.report import ReportStatus

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int

class ReportCreate(BaseModel):
    reported_id: uuid.UUID
    reason: str
    details: Optional[str] = None

class ReportResponse(BaseModel):
    id: uuid.UUID
    reporter_id: uuid.UUID
    reported_id: uuid.UUID
    reason: str
    details: Optional[str] = None
    status: ReportStatus
    created_at: datetime

    class Config:
        from_attributes = True

class BlockCreate(BaseModel):
    blocked_id: uuid.UUID

class AdminActionCreate(BaseModel):
    target_user_id: uuid.UUID
    action_type: str
    reason: Optional[str] = None

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_matches: int
    total_messages: int
    pending_reports: int

class UserActivityResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    activity_type: str
    details: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

from schemas.profile import ProfileResponse

class AdminUserDetailsResponse(BaseModel):
    user: AdminUserResponse
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True
