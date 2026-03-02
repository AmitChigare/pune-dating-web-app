import uuid
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.streak import UserStreak

class StreakService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_streak(self, user_id: uuid.UUID) -> UserStreak:
        qry = select(UserStreak).where(UserStreak.user_id == user_id)
        result = await self.db.execute(qry)
        streak = result.scalars().first()
        
        if not streak:
            streak = UserStreak(
                user_id=user_id,
                current_streak=0,
                longest_streak=0,
                last_active_date=None,
                badges=[]
            )
            self.db.add(streak)
            await self.db.flush()
            
        return streak

    async def process_daily_activity(self, user_id: uuid.UUID) -> None:
        """
        Background task to update user's daily streak.
        Should be called once per authenticated request, but only performs DB updates if the date has changed.
        """
        today = date.today()
        
        streak = await self.get_or_create_streak(user_id)
        
        # If already logged activity today, do nothing
        if streak.last_active_date == today:
            return
            
        # Calculate streak logic
        yesterday = today - timedelta(days=1)
        
        if streak.last_active_date == yesterday:
            # Continuing a streak
            streak.current_streak += 1
        else:
            # Breaking a streak or starting a brand new one
            streak.current_streak = 1
            
        # Update longest streak
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
            
        # Milestone Badges
        milestones = {
            3: "3_day_fire",
            7: "7_day_flame",
            14: "14_day_inferno",
            30: "30_day_legend"
        }
        
        current_badges = streak.badges if streak.badges else []
        
        if streak.current_streak in milestones:
            new_badge = milestones[streak.current_streak]
            if new_badge not in current_badges:
                current_badges.append(new_badge)
                # Ensure SQLAlchemy detects the JSONB array mutation
                from sqlalchemy.orm.attributes import flag_modified
                streak.badges = current_badges
                flag_modified(streak, "badges")

        streak.last_active_date = today
        
        await self.db.commit()

    async def get_streak_info(self, user_id: uuid.UUID) -> dict:
        streak = await self.get_or_create_streak(user_id)
        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "badges": streak.badges
        }
