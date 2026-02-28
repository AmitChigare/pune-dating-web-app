from sqlalchemy import ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Message(BaseModel):
    __tablename__ = "messages"

    match_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), index=True)
    sender_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    content: Mapped[str] = mapped_column(String)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    match = relationship("Match", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
