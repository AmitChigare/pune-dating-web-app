from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid

from models.like import Like
from models.match import Match
from schemas.interactions import LikeCreate

class MatchingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_like(self, from_user_id: uuid.UUID, like_in: LikeCreate):
        # Prevent self-like
        if from_user_id == like_in.to_user_id:
            raise HTTPException(status_code=400, detail="Cannot like yourself")

        # Check if like already exists
        existing_like_qry = select(Like).where(
            Like.from_user_id == from_user_id, Like.to_user_id == like_in.to_user_id
        )
        existing_like = (await self.db.execute(existing_like_qry)).scalars().first()
        if existing_like:
            return {"status": "already_liked", "match": False}

        # Create like
        new_like = Like(
            from_user_id=from_user_id,
            to_user_id=like_in.to_user_id,
            is_superlike=like_in.is_superlike
        )
        self.db.add(new_like)

        # Check for mutual like
        mutual_like_qry = select(Like).where(
            Like.from_user_id == like_in.to_user_id, Like.to_user_id == from_user_id
        )
        mutual_like = (await self.db.execute(mutual_like_qry)).scalars().first()

        match_created = False
        match = None
        if mutual_like:
            # Create a match
            match = Match(user1_id=from_user_id, user2_id=like_in.to_user_id)
            self.db.add(match)
            match_created = True

        await self.db.commit()
        return {"status": "success", "match": match_created, "match_id": match.id if match else None}

    async def get_matches(self, user_id: uuid.UUID):
        # A match involves user_id as either user1_id or user2_id
        from sqlalchemy import or_, and_, not_, exists
        from sqlalchemy.orm import selectinload
        from models.profile import Profile
        from models.user import User
        from models.block import Block

        # Subquery to check for blocks between the two users
        block_exists = exists().where(
            or_(
                and_(Block.blocker_id == user_id, Block.blocked_id == Match.user1_id),
                and_(Block.blocker_id == user_id, Block.blocked_id == Match.user2_id),
                and_(Block.blocked_id == user_id, Block.blocker_id == Match.user1_id),
                and_(Block.blocked_id == user_id, Block.blocker_id == Match.user2_id)
            )
        )

        qry = select(Match).where(
            or_(Match.user1_id == user_id, Match.user2_id == user_id),
            Match.is_active == True,
            not_(block_exists)
        )
        result = await self.db.execute(qry)
        matches = result.scalars().all()

        for match in matches:
            peer_id = match.user1_id if match.user2_id == user_id else match.user2_id
            profile_qry = select(Profile).join(User, Profile.user_id == User.id).options(selectinload(Profile.user).selectinload(User.photos)).where(Profile.user_id == peer_id)
            peer_profile = (await self.db.execute(profile_qry)).scalars().first()
            if peer_profile:
                # Convert to dict for the Pydantic peer_profile: dict | None field
                photos = getattr(peer_profile.user, 'photos', [])
                match.peer_profile = {
                    "first_name": peer_profile.first_name,
                    "bio": peer_profile.bio,
                    "photos": [{"url": p.url, "is_primary": p.is_primary} for p in photos]
                }
            else:
                match.peer_profile = None

        return matches
