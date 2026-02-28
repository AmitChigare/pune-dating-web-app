# Backend Setup & Development Guide

## Prerequisites
- Python 3.11 or higher
- PostgreSQL (Local or Cloud like Supabase)
- Redis (Local or Cloud like Upstash)
- Docker & Docker Compose (optional but recommended)

## Initial Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Environment Variables

Create a `.env` file in the `backend/` root directory and configure the following variables:

```env
ENVIRONMENT=development
PROJECT_NAME="Dating App API"
API_V1_STR=/api/v1
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=dating_app
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave blank if local
```

## Running the Application Locally

### 1. Start External Services
If you don't have local Postgres/Redis, use Docker:
```bash
docker-compose up -d db redis
```

### 2. Database Migrations
Run the Alembic migrations to build the tables:
```bash
alembic upgrade head
```

### 3. Start the Server
Start the Uvicorn ASGI server with automatic reloading:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Your API will be running at `http://localhost:8000`.

### 4. Interactive API Documentation
FastAPI automatically generates interactive Swagger documentation. You can view all available API endpoints, test them, and inspect their schemas by visiting:
**`http://localhost:8000/docs`**

## Scripts & Utilities

- `create_100_dummies.py`: Automatically seeds the database with 100 random profiles simulating real users residing in Pune.
- `create_admin.py`: Generates an Admin user account that you can use to log into the application and view the `/admin` dashboard.

*To run them:*
```bash
python create_100_dummies.py
```
