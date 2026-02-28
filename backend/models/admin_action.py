from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel
from sqlalchemy.dialects.postgresql import UUID
import uuid

class AdminAction(BaseModel):
    __tablename__ = "admin_actions"

    admin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    target_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    action_type: Mapped[str] = mapped_column(String(50))
    reason: Mapped[str] = mapped_column(Text, nullable=True)

    admin = relationship("User", foreign_keys=[admin_id])
    target_user = relationship("User", foreign_keys=[target_user_id])
