import asyncio
import random
import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from config.settings import settings
from models.user import User, UserRole
from models.profile import Profile
from models.photo import Photo
from utils.security import get_password_hash

async def create_100_dummies():
    engine = create_async_engine(settings.ASYNC_DATABASE_URI, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    first_names_men = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"]
    first_names_women = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
    
    async with async_session() as session:
        print("Starting 100 dummy user generation...")
        for i in range(1, 101):
            email = f"auto_user_{i}@dating.com"
            existing = (await session.execute(select(User).where(User.email == email))).scalars().first()
            if existing:
                continue
                
            # Randomize gender
            gender = random.choice(["Man", "Woman"])
            if gender == "Man":
                first_name = random.choice(first_names_men)
                interested_in = random.choice(["Women", "Everyone"])
            else:
                first_name = random.choice(first_names_women)
                interested_in = random.choice(["Men", "Everyone"])
                
            last_name = random.choice(last_names)
            
            # Random age between 18 and 50
            age = random.randint(18, 50)
            today = datetime.date.today()
            birth_date = datetime.date(today.year - age, random.randint(1, 12), random.randint(1, 28))
            
            # 1. Create User
            user = User(
                email=email,
                hashed_password=get_password_hash("password123"),
                is_active=True,
                is_verified=True,
                role=UserRole.USER
            )
            session.add(user)
            await session.commit()
            
            # 2. Create Profile
            profile = Profile(
                user_id=user.id,
                first_name=first_name,
                last_name=last_name,
                bio=f"Hi, I'm {first_name}! Just a randomly generated {age}-year-old looking for connections.",
                birth_date=birth_date,
                gender=gender,
                interested_in=interested_in
            )
            session.add(profile)
            
            # 3. Create 1-3 Photos
            num_photos = random.randint(1, 3)
            for p in range(num_photos):
                # Using unique random query string to bypass placeholder caching, making it look slightly different if possible
                # Wait, placeholder just shows text. Let's make the text descriptive.
                photo = Photo(
                    user_id=user.id,
                    url=f"https://via.placeholder.com/400x500?text={first_name}+Photo+{p+1}",
                    is_primary=(p == 0),
                    order=p
                )
                session.add(photo)
                
            await session.commit()
            
            if i % 10 == 0:
                print(f"Generated {i}/100 users...")

        print("Finished generating dummy users.")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_100_dummies())
