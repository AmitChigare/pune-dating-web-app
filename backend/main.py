from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from middleware.rate_limit import RateLimitMiddleware
from middleware.security_headers import SecurityHeadersMiddleware
from middleware.logging import StructLoggerMiddleware
from routes import auth, users, photos, matches, chat, admin, reports
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url=None,
    redoc_url=None,
    openapi_url=None
)

# CORS
origins = [
    settings.FRONTEND_URL.rstrip("/"),
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else origins,
    allow_origin_regex=r"https://.*" if settings.ENVIRONMENT == "production" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security, Logging, and Rate limiting
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(StructLoggerMiddleware)
app.add_middleware(RateLimitMiddleware)

# Serve static uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(photos.router, prefix=f"{settings.API_V1_STR}/photos", tags=["photos"])
app.include_router(matches.router, prefix=f"{settings.API_V1_STR}/matches", tags=["matches"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])

@app.get("/")
def root():
    return {"message": "Welcome to the Dating App API."}

from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi import HTTPException
from models.user import User
from routes.dependencies import get_current_user

@app.get("/api/v1/docs", include_in_schema=False)
async def custom_swagger_ui_html(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return get_swagger_ui_html(
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        title=app.title + " - Swagger UI"
    )

@app.get(f"{settings.API_V1_STR}/openapi.json", include_in_schema=False)
async def get_openapi_endpoint(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return get_openapi(title=app.title, version="1.0.0", routes=app.routes)

@app.get("/health")
def health_check():
    return {"status": "ok"}
