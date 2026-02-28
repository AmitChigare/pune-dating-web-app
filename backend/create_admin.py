import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from config.settings import settings
from models.user import User
from utils.security import get_password_hash

async def create_admin_user():
    print("Connecting to database...")
    engine = create_async_engine(settings.ASYNC_DATABASE_URI, echo=False)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    admin_email = "admin@dating.com"
    admin_password = "SecureAdminPassword123!"
    
    async with async_session() as session:
        # Check if admin already exists
        # In SQLAlchemy 2.0, we use select
        from sqlalchemy.future import select
        result = await session.execute(select(User).where(User.email == admin_email))
        user = result.scalars().first()
        
        if user:
            print(f"Admin user already exists with email: {admin_email}")
            print(f"Password remains unchanged.")
        else:
            print("Creating new admin user...")
            # bcrypt limit is 72 bytes, so we ensure the password strings fit those limits
            hashed_password = get_password_hash(admin_password)
            new_admin = User(
                email=admin_email,
                hashed_password=hashed_password,
                is_active=True,
                is_verified=True,
                role="admin"
            )
            session.add(new_admin)
            await session.commit()
            print(f"✅ Admin user created successfully!")
            print(f"Email: {admin_email}")
            print(f"Password: {admin_password}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
