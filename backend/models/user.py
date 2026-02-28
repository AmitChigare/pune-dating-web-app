from sqlalchemy import Boolean, String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import BaseModel
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_shadowbanned: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER)
    
    profile: Mapped["Profile"] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    photos: Mapped[list["Photo"]] = relationship("Photo", back_populates="user", cascade="all, delete-orphan")
    prompts: Mapped[list["Prompt"]] = relationship("Prompt", back_populates="user", cascade="all, delete-orphan")
