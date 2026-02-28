import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, selectinload
from sqlalchemy import select
from config.settings import settings
from models.user import User
from models.profile import Profile

async def inspect():
    engine = create_async_engine(settings.ASYNC_DATABASE_URI, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("--- USERS ---")
        users = (await session.execute(select(User))).scalars().all()
        for u in users:
            print(f"User: {u.id}, email: {u.email}, active: {u.is_active}")
            
        print("\n--- PROFILES ---")
        profiles = (await session.execute(select(Profile))).scalars().all()
        for p in profiles:
            print(f"Profile User: {p.user_id}, Name: {p.first_name}, Gender: {p.gender}, Seeking: {p.interested_in}, DOB: {p.birth_date}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(inspect())
