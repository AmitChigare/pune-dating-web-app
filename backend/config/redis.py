import redis.asyncio as aioredis
from config.settings import settings

async def get_redis_pool():
    # Render/Upstash secure Redis typically needs `rediss://` (with 2 s's for TLS)
    protocol = "rediss://" if "upstash.io" in settings.REDIS_HOST else "redis://"
    auth = f":{settings.REDIS_PASSWORD}@" if settings.REDIS_PASSWORD else ""
    redis_url = f"{protocol}{auth}{settings.REDIS_HOST}:{settings.REDIS_PORT}"
    
    pool = aioredis.ConnectionPool.from_url(
        redis_url, encoding="utf8", decode_responses=True
    )
    return aioredis.Redis(connection_pool=pool)
