import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from config.settings import settings
from models.user import User, UserRole
from models.profile import Profile
from utils.security import get_password_hash
import datetime

async def create_dummies():
    engine = create_async_engine(settings.ASYNC_DATABASE_URI, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if dummy1 exists
        existing = (await session.execute(select(User).where(User.email == "dummy1@dating.com"))).scalars().first()
        if not existing:
            user1 = User(
                email="dummy1@dating.com",
                hashed_password=get_password_hash("password123"),
                is_active=True,
                is_verified=True,
                role=UserRole.USER
            )
            session.add(user1)
            await session.commit()
            
            profile1 = Profile(
                user_id=user1.id,
                first_name="Jane",
                last_name="Doe",
                bio="Just a dummy user looking for love!",
                birth_date=datetime.date(1995, 5, 20),
                gender="Women",
                interested_in="Men"
            )
            session.add(profile1)
            await session.commit()
            print("Created dummy1@dating.com (Jane)")
            
        existing2 = (await session.execute(select(User).where(User.email == "dummy2@dating.com"))).scalars().first()
        if not existing2:
            user2 = User(
                email="dummy2@dating.com",
                hashed_password=get_password_hash("password123"),
                is_active=True,
                is_verified=True,
                role=UserRole.USER
            )
            session.add(user2)
            await session.commit()
            
            profile2 = Profile(
                user_id=user2.id,
                first_name="Sarah",
                last_name="Smith",
                bio="Coffee enthusiast and dummy profile.",
                birth_date=datetime.date(1998, 8, 15),
                gender="Women",
                interested_in="Men"
            )
            session.add(profile2)
            await session.commit()
            print("Created dummy2@dating.com (Sarah)")

        print("Finished creating dummies.")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_dummies())
