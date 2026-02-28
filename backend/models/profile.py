from sqlalchemy import String, Float, ForeignKey, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime

class Profile(BaseModel):
    __tablename__ = "profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50), nullable=True)
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    birth_date: Mapped[datetime.date] = mapped_column(Date)
    gender: Mapped[str] = mapped_column(String(20))
    interested_in: Mapped[str] = mapped_column(String(20))
    phone_number: Mapped[str] = mapped_column(String(20), nullable=True)
    
    # Location tracking
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="profile")
