from sqlalchemy import ForeignKey, Integer, Date, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from datetime import date

class UserStreak(BaseModel):
    __tablename__ = "user_streaks"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_active_date: Mapped[date] = mapped_column(Date, nullable=True)
    badges: Mapped[list[str]] = mapped_column(JSONB, default=list)

    user = relationship("User", back_populates="streak")
