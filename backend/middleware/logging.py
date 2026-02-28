import uuid
import time
import json
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("api_logger")
logger.setLevel(logging.INFO)
# Clear existing handlers to prevent duplicate logs
if logger.hasHandlers():
    logger.handlers.clear()
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(message)s'))
logger.addHandler(handler)

class StructLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        # We attach the request_id to request state so downstream functions can use it, though fastapi doesn't easily thread context without ContextVars.
        request.state.request_id = request_id
        
        # Execute the request
        try:
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                client_ip = forwarded_for.split(",")[0].strip()
            else:
                client_ip = request.client.host if request.client else "unknown"
            
            response: Response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Request-ID"] = request_id
            
            log_dict = {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(process_time * 1000, 2),
                "client_ip": client_ip
            }
            
            # Prevent logging health endpoints if they spam too much, but for now log all
            logger.info(json.dumps(log_dict))
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            log_dict = {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "error": str(e),
                "duration_ms": round(process_time * 1000, 2),
                "client_ip": client_ip
            }
            # Specifically omit printing stack trace into structured log (prevent secret leakage)
            logger.error(json.dumps(log_dict))
            raise e
