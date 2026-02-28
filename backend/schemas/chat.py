from pydantic import BaseModel
import uuid
from datetime import datetime

class MessageCreate(BaseModel):
    content: str
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
