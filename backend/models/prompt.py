from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Prompt(BaseModel):
    __tablename__ = "prompts"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    question: Mapped[str] = mapped_column(String)
    answer: Mapped[str] = mapped_column(String)

    user: Mapped["User"] = relationship("User", back_populates="prompts")
