from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel
from sqlalchemy.dialects.postgresql import UUID
import uuid

class UserActivity(BaseModel):
    __tablename__ = "user_activities"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    activity_type: Mapped[str] = mapped_column(String(50))
    details: Mapped[str] = mapped_column(Text, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
