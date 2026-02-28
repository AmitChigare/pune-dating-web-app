from pydantic import BaseModel
import uuid

class PhotoResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    url: str
    is_primary: bool
    order: int

    class Config:
        from_attributes = True
