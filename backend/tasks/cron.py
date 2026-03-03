import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from config.database import AsyncSessionLocal
from models.match import Match
from services.compatibility_service import CompatibilityService

scheduler = AsyncIOScheduler()

async def recalculate_match_scores():
    """
    Background Cron Task: 
    Iterates over all active matches in chunks and recalculates their compatibility scores 
    using cached Feature Vectors to avoid O(N^2) DB joins.
    """
    print("[CRON] Starting compatibility score recalculation batch jobs...")
    
    async with AsyncSessionLocal() as db:
        service = CompatibilityService(db)
        
        offset = 0
        limit = 500
        
        while True:
            # Query matches in chunk sizes of 500 to prevent RAM exhaustion
            query = select(Match).where(Match.is_active == True).offset(offset).limit(limit)
            result = await db.execute(query)
            matches = result.scalars().all()
            
            if not matches:
                break
                
            for match in matches:
                try:
                    score = await service.compute_compatibility_score(match.id, match.user1_id, match.user2_id)
                    match.compatibility_score = score
                except Exception as e:
                    print(f"Error scoring match {match.id}: {e}")
                    
            await db.commit()
            print(f"[CRON] Processed batch {offset} to {offset+limit}. Pausing briefly...")
            
            offset += limit
            # Give the database thread pool a chance to breathe
            await asyncio.sleep(2)
            
    print("[CRON] Compatibility scoring completed.")

def start_scheduler():
    """
    Attaches the scheduled routines.
    Currently configured to run 2 times a day.
    """
    scheduler.add_job(recalculate_match_scores, 'cron', hour='3,15')
    scheduler.start()
