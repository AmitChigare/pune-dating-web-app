import math
from typing import List, Dict, Any
from uuid import UUID
import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from config.redis import get_redis_pool
from models.user import User
from models.profile import Profile
from models.streak import UserStreak
from models.message import Message
from models.prompt import Prompt

class CompatibilityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_user_features(self, user_id: UUID) -> Dict[str, Any]:
        """
        Retrieves feature vectors tailored for compatibility scoring points.
        Uses Redis to cache the database joins.
        """
        redis = await get_redis_pool()
        cache_key = f"user:features:{str(user_id)}"
        
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)
            
        # Heavy DB query if cache miss
        from sqlalchemy.orm import selectinload
        query = select(User).where(User.id == user_id).options(
            selectinload(User.profile),
            selectinload(User.streak),
            selectinload(User.prompts)
        )
        result = await self.db.execute(query)
        user = result.scalars().first()
        
        if not user or not user.profile:
            return {}

        features = {
            "latitude": user.profile.latitude,
            "longitude": user.profile.longitude,
            "interests": user.profile.interests or [],
            "streak": user.streak.current_streak if user.streak else 0,
            "prompts": " ".join([p.answer.lower() for p in user.prompts])
        }
        
        # Cache for 24 hours
        await redis.setex(cache_key, 86400, json.dumps(features))
        return features

    def calculate_distance_score(self, lat1: float, lon1: float, lat2: float, lon2: float) -> int:
        if None in [lat1, lon1, lat2, lon2]:
            return 10 # Default fallback
            
        # Haversine formula
        R = 6371.0 # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c
        
        # 0km = 20 pts, 100km+ = 0 pts
        score = max(0, 20 - (distance / 5))
        return int(score)

    def calculate_interests_score(self, list1: List[str], list2: List[str]) -> int:
        if not list1 or not list2:
            return 5 # Neutral baseline
            
        set1 = set([i.lower() for i in list1])
        set2 = set([i.lower() for i in list2])
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        # Jaccard index heavily weighted (max 30 pts)
        jaccard = intersection / union if union > 0 else 0
        return int(min(30, (jaccard * 40)))

    def calculate_prompt_similarity(self, text1: str, text2: str) -> int:
        import re
        words1 = set(re.findall(r'\w+', text1))
        words2 = set(re.findall(r'\w+', text2))
        
        ignore = {'the', 'a', 'an', 'and', 'or', 'but', 'is', 'to', 'of'}
        words1 -= ignore
        words2 -= ignore
        
        # Max 15 points
        overlap = len(words1.intersection(words2))
        return int(min(15, overlap * 2))

    async def calculate_engagement_score(self, match_id: UUID) -> int:
        # Check messages for this match
        query = select(Message).where(Message.match_id == match_id).order_by(Message.created_at.desc()).limit(100)
        result = await self.db.execute(query)
        messages = result.scalars().all()
        
        # No messages = baseline generic 10
        if not messages:
            return 10
            
        # If massive convo, award full 20 pts
        if len(messages) > 50:
            return 20
            
        return int(10 + (len(messages) / 5))

    async def compute_compatibility_score(self, match_id: UUID, user1_id: UUID, user2_id: UUID) -> int:
        f1 = await self._get_user_features(user1_id)
        f2 = await self._get_user_features(user2_id)
        
        if not f1 or not f2:
            return 50 # Baseline median if data is horribly missing
            
        # 1. Location (max 20)
        location_pts = self.calculate_distance_score(f1.get('latitude'), f1.get('longitude'), f2.get('latitude'), f2.get('longitude'))
        
        # 2. Interests (max 30)
        interest_pts = self.calculate_interests_score(f1.get('interests', []), f2.get('interests', []))
        
        # 3. Prompt Overlap (max 15)
        prompt_pts = self.calculate_prompt_similarity(f1.get('prompts', ''), f2.get('prompts', ''))
        
        # 4. Activity/Streak Bonus (max 15)
        # Highly engaged (active string) members get an automatic bump because they are likelier to reply
        streak_bonus = min(15, (f1.get('streak', 0) + f2.get('streak', 0)) / 2)
        
        # 5. Active Chat Engagement (max 20)
        chat_pts = await self.calculate_engagement_score(match_id)
        
        total_score = location_pts + interest_pts + prompt_pts + int(streak_bonus) + chat_pts
        
        # Clamp between 0 and 100
        return max(0, min(100, total_score))
