from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from models.user import User
from routes.dependencies import get_current_user
from schemas.interactions import LikeCreate, MatchResponse
from services.matching_service import MatchingService
from typing import List
from models.block import Block
import uuid

router = APIRouter()

@router.post("/like")
async def like_user(
    like_in: LikeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    matching_service = MatchingService(db)
    result = await matching_service.create_like(current_user.id, like_in)
    return result

@router.get("/", response_model=List[MatchResponse])
async def get_my_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    matching_service = MatchingService(db)
    matches = await matching_service.get_matches(current_user.id)
    return matches

@router.post("/{peer_id}/block")
async def block_user(
    peer_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.future import select
    # Check if already blocked
    existing = await db.execute(
        select(Block).where(Block.blocker_id == current_user.id, Block.blocked_id == peer_id)
    )
    if existing.scalars().first():
        return {"detail": "User already blocked"}

    block = Block(blocker_id=current_user.id, blocked_id=peer_id)
    db.add(block)
    await db.commit()
    return {"detail": "User blocked successfully"}
