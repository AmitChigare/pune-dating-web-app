# Database Architecture & Schema

The Pune Dating App uses a PostgreSQL database with SQLAlchemy as the async Object-Relational Mapper (ORM). Alembic is used for schema migrations.

## Core Entities (Models)

### 1. User (`users` table)
The foundational entity representing an authenticated individual.
- `id` (UUID, Primary Key)
- `email` (String, Unique, Indexed)
- `hashed_password` (String)
- `role` (Enum): `user` or `admin`
- `is_active` (Boolean): System-level activate/deactivate state
- `is_banned` (Boolean): Admin moderation flag

### 2. Profile (`profiles` table)
Contains the public-facing demographic and dating information for a User.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key) -> `users.id`
- `first_name` (String)
- `birth_date` (Date)
- `gender` (Enum): Target values e.g., 'Man', 'Woman', 'Non-binary'
- `interested_in` (Enum): Target values e.g., 'Men', 'Women', 'Everyone'
- `latitude` (Float, Indexed): Enforced geographically over the Pune region
- `longitude` (Float, Indexed)
- `elo_rating` (Integer): Starting value `1500`, dynamic sorting metric
- `phone_number` (String, Optional)
- `bio` (Text, Optional)

### 3. Photo (`photos` table)
Stores the URLs mapping to cloud-provider image assets for a user's profile.
- `id` (UUID, Primary Key)
- `profile_id` (UUID, Foreign Key) -> `profiles.id`
- `url` (String)
- `is_primary` (Boolean): Identifies the main avatar photograph

### 4. Swipe (`swipes` table)
Records a unidirectional interaction (Like/Pass).
- `id` (UUID, Primary Key)
- `swiper_id` (UUID, Foreign Key) -> `profiles.id`
- `swiped_id` (UUID, Foreign Key) -> `profiles.id`
- `is_like` (Boolean): True=Like, False=Pass
- `created_at` (DateTime)

### 5. Match (`matches` table)
A bidirectional connection created when User A likes User B _and_ User B likes User A.
- `id` (UUID, Primary Key)
- `user1_id` (UUID, Foreign Key) -> `profiles.id`
- `user2_id` (UUID, Foreign Key) -> `profiles.id`
- `created_at` (DateTime)

### 6. Message (`messages` table)
Represents a single chat payload within a specific matched context.
- `id` (UUID, Primary Key)
- `match_id` (UUID, Foreign Key) -> `matches.id`
- `sender_id` (UUID, Foreign Key) -> `profiles.id`
- `content` (Text)
- `is_read` (Boolean): Triggers the red-dot unread UI globally
- `created_at` (DateTime)

### 7. UserActivity (`user_activities` table)
Analytical and diagnostic trace records, largely for the Admin Dashboard.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key) -> `users.id`
- `action` (String): e.g., `login_success`, `banned_user`, `profile_updated`
- `created_at` (DateTime)

## Alembic Migrations

The schema above is fully managed by Alembic. Any changes made to the SQLAlchemy files inside the `models/` directory must be captured in a migration script.

1. **Auto-generate a migration:**
```bash
alembic revision --autogenerate -m "Add short description of your change"
```

2. **Apply the migration:**
```bash
alembic upgrade head
```
