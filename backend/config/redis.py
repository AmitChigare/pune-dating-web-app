import redis.asyncio as aioredis
from config.settings import settings

async def get_redis_pool():
    redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}"
    pool = aioredis.ConnectionPool.from_url(
        redis_url, encoding="utf8", decode_responses=True
    )
    return aioredis.Redis(connection_pool=pool)
