import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import update
from config.settings import settings
from models.user import User

async def activate_all_users():
    print("Connecting to database...")
    engine = create_async_engine(settings.ASYNC_DATABASE_URI, echo=False)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        print("Activating all existing users...")
        await session.execute(
            update(User).values(is_active=True, is_verified=True)
        )
        await session.commit()
        print("✅ All users activated and verified!")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(activate_all_users())
