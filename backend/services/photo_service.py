import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.photo import Photo

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PhotoService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload_photo(self, user_id: uuid.UUID, file: UploadFile, is_primary: bool = False) -> Photo:
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            raise HTTPException(status_code=400, detail="Invalid file type")

        # Give unique filename
        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Check existing photos order
        result = await self.db.execute(select(Photo).where(Photo.user_id == user_id).order_by(Photo.order.desc()))
        last_photo = result.scalars().first()
        new_order = last_photo.order + 1 if last_photo else 0

        # If this is set as primary, unset others
        if is_primary:
            all_photos = await self.db.execute(select(Photo).where(Photo.user_id == user_id))
            for photo in all_photos.scalars().all():
                photo.is_primary = False

        photo = Photo(
            user_id=user_id,
            url=f"/{UPLOAD_DIR}/{filename}",
            is_primary=is_primary,
            order=new_order
        )
        self.db.add(photo)
        await self.db.commit()
        await self.db.refresh(photo)
        return photo

    async def delete_my_photo(self, user_id: uuid.UUID, photo_id: uuid.UUID):
        from sqlalchemy import func
        # Check how many photos the user has
        count_qry = select(func.count(Photo.id)).where(Photo.user_id == user_id)
        count = (await self.db.execute(count_qry)).scalar()
        
        if count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete your last photo.")
            
        photo = await self.db.get(Photo, photo_id)
        if not photo or photo.user_id != user_id:
            raise HTTPException(status_code=404, detail="Photo not found")
            
        # If deleting primary, make another photo primary if possible
        was_primary = photo.is_primary
        await self.db.delete(photo)
        
        if was_primary:
            next_photo = (await self.db.execute(select(Photo).where(Photo.user_id == user_id, Photo.id != photo_id).limit(1))).scalars().first()
            if next_photo:
                next_photo.is_primary = True
                
        await self.db.commit()
        
        # Optional: delete file from disk
        try:
            file_path = photo.url.lstrip("/")
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
            
        return {"status": "success"}
