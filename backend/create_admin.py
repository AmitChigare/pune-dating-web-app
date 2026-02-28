import asyncio
import uuid
from config.database import AsyncSessionLocal
from models.user import User, UserRole
from utils.security import get_password_hash

async def create_admin():
    async with AsyncSessionLocal() as db:
        # Check if admin already exists
        from sqlalchemy.future import select
        result = await db.execute(select(User).where(User.email == "admin@punedating.com"))
        admin_user = result.scalars().first()
        
        if not admin_user:
            admin_user = User(
                email="admin@punedating.com",
                hashed_password=get_password_hash("PuneAdmin2026!"),
                is_active=True,
                is_verified=True,
                role=UserRole.ADMIN
            )
            db.add(admin_user)
            await db.commit()
            print("Admin user created successfully.")
            print("Email: admin@punedating.com")
            print("Password: PuneAdmin2026!")
        else:
            print("Admin user already exists.")
            print("Email: admin@punedating.com")
            print("Password: PuneAdmin2026! (assuming default)")

if __name__ == "__main__":
    asyncio.run(create_admin())
