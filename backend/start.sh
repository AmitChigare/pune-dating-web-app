#!/bin/bash
set -e

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Start application
echo "Starting application..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
