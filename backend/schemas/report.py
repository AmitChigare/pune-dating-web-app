from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime
from models.report import ReportStatus

class ReportCreate(BaseModel):
    reported_id: uuid.UUID
    reason: str = Field(..., max_length=100)
    details: Optional[str] = Field(None, max_length=1000)

class ReportResponse(BaseModel):
    id: uuid.UUID
    reporter_id: uuid.UUID
    reported_id: uuid.UUID
    reason: str
    details: Optional[str]
    status: ReportStatus
    created_at: datetime

    class Config:
        from_attributes = True
