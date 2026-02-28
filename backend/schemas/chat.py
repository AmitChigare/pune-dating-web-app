from pydantic import BaseModel, Field
import uuid
from datetime import datetime

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    # Note: match_id is usually extracted from the route path

class MessageResponse(BaseModel):
    id: uuid.UUID
    match_id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
