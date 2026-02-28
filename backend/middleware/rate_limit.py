from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
from config.redis import get_redis_pool

# Basic rate limit settings: 100 requests per minute per IP
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_WINDOW = 60

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We can exempt paths if needed
        if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await call_next(request)
            
        # Dynamic limits based on path
        is_login = request.url.path.endswith("/auth/login")
        limit_requests = 5 if is_login else RATE_LIMIT_REQUESTS
        limit_window = 900 if is_login else RATE_LIMIT_WINDOW
        
        client_ip = request.client.host if request.client else "unknown"
        try:
            redis = await get_redis_pool()
            
            current_time = int(time.time())
            window_start = current_time - limit_window
            
            key_prefix = "rate_limit_login" if is_login else "rate_limit"
            key = f"{key_prefix}:{client_ip}"
            
            # We use a sorted set to count requests in the rolling window
            async with redis.pipeline(transaction=True) as pipe:
                pipe.zremrangebyscore(key, 0, window_start) # clean old requests
                pipe.zcard(key) # count current requests
                pipe.zadd(key, {str(current_time): current_time})
                pipe.expire(key, limit_window)
                results = await pipe.execute()
                
            request_count = results[1]
            
            if request_count >= limit_requests:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."}
                )
        except Exception as e:
            # If Redis connection fails, we shouldn't completely crash the whole app.
            # Gracefully bypass rate limiting.
            print(f"Redis rate limit error: {e}")
            pass
            
        response = await call_next(request)
        return response
