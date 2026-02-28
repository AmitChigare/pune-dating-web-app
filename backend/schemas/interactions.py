from pydantic import BaseModel
import uuid
from datetime import datetime

class LikeCreate(BaseModel):
    to_user_id: uuid.UUID
    is_superlike: bool = False

class MatchResponse(BaseModel):
    id: uuid.UUID
    user1_id: uuid.UUID
    user2_id: uuid.UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
