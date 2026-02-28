from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import uuid

from config.database import get_db
from models.user import User
from models.report import Report, ReportStatus
from routes.dependencies import get_current_user
from schemas.report import ReportCreate, ReportResponse

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id == report_in.reported_id:
        raise HTTPException(status_code=400, detail="You cannot report yourself")

    # Check if target user exists
    target_user = await db.execute(select(User).where(User.id == report_in.reported_id))
    target_user = target_user.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Reported user not found")

    # Prevent duplicate active reports
    existing_report = await db.execute(
        select(Report).where(
            Report.reporter_id == current_user.id,
            Report.reported_id == report_in.reported_id,
            Report.status == ReportStatus.PENDING
        )
    )
    if existing_report.scalars().first():
        raise HTTPException(status_code=400, detail="You already have a pending report against this user")

    # Create the report
    new_report = Report(
        reporter_id=current_user.id,
        reported_id=report_in.reported_id,
        reason=report_in.reason,
        details=report_in.details,
    )
    db.add(new_report)
    await db.commit()

    # Check auto-suspend threshold (5 unresolved reports)
    unresolved_count_query = select(func.count(Report.id)).where(
        Report.reported_id == report_in.reported_id,
        Report.status == ReportStatus.PENDING
    )
    unresolved_count = (await db.execute(unresolved_count_query)).scalar()

    if unresolved_count and unresolved_count >= 5:
        # Auto-suspend
        target_user.is_active = False
        target_user.is_shadowbanned = True # apply shadowban or just deactivate
        await db.commit()

    await db.refresh(new_report)
    return new_report
