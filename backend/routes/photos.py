from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from config.database import get_db
from models.user import User
from routes.dependencies import get_current_user
from schemas.photo import PhotoResponse
from services.photo_service import PhotoService

router = APIRouter()

@router.post("/", response_model=PhotoResponse)
async def upload_user_photo(
    file: UploadFile = File(...),
    is_primary: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    photo_service = PhotoService(db)
    photo = await photo_service.upload_photo(current_user.id, file, is_primary)
    return photo

@router.delete("/{photo_id}")
async def delete_my_photo(
    photo_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    photo_service = PhotoService(db)
    return await photo_service.delete_my_photo(current_user.id, photo_id)
