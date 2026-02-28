FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy project
COPY . /app/

# Make start script executable
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 8000

# Command to run the application using the start script
CMD ["/app/start.sh"]
