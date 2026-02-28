from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from config.database import get_db
from models.user import User
from routes.dependencies import get_current_user, get_current_admin
from schemas.admin import (
    ReportCreate, ReportResponse, BlockCreate, AdminActionCreate,
    PaginatedResponse, AdminStatsResponse, AdminUserResponse, UserActivityResponse,
    AdminUserDetailsResponse
)
from services.admin_service import AdminService
from models.report import ReportStatus

router = APIRouter()

# Regular user routes: Report, Block
@router.post("/report", response_model=ReportResponse)
async def report_user(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    admin_service = AdminService(db)
    report = await admin_service.report_user(current_user.id, report_in)
    return report

@router.post("/block")
async def block_user(
    block_in: BlockCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    admin_service = AdminService(db)
    block = await admin_service.block_user(current_user.id, block_in.blocked_id)
    return {"status": "User blocked successfully"}

# Admin only routes
@router.get("/reports", response_model=PaginatedResponse[ReportResponse])
async def get_pending_reports(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    admin_service = AdminService(db)
    reports = await admin_service.get_pending_reports(page, size)
    return reports

@router.post("/action")
async def take_admin_action(
    action_in: AdminActionCreate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    admin_service = AdminService(db)
    action = await admin_service.take_admin_action(current_admin.id, action_in)
    return {"status": "Action recorded successfully"}

@router.get("/stats", response_model=AdminStatsResponse)
async def get_statistics(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    admin_service = AdminService(db)
    return await admin_service.get_statistics()

@router.get("/users", response_model=PaginatedResponse[AdminUserResponse])
async def get_all_users(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    admin_service = AdminService(db)
    return await admin_service.get_all_users(page, size, search)

@router.get("/users/{user_id}", response_model=AdminUserDetailsResponse)
async def get_user_details(
    user_id: uuid.UUID,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    from fastapi import HTTPException
    admin_service = AdminService(db)
    user_details = await admin_service.get_user_details(user_id)
    if not user_details:
        raise HTTPException(status_code=404, detail="User not found")
    return user_details

@router.get("/users/{user_id}/activity", response_model=PaginatedResponse[UserActivityResponse])
async def get_user_activity(
    user_id: uuid.UUID,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    admin_service = AdminService(db)
    return await admin_service.get_user_activities(user_id, page, size)

@router.delete("/photos/{photo_id}")
async def delete_photo(
    photo_id: uuid.UUID,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    admin_service = AdminService(db)
    return await admin_service.delete_photo(current_admin.id, photo_id)

@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: uuid.UUID,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    admin_service = AdminService(db)
    return await admin_service.delete_message(current_admin.id, message_id)
