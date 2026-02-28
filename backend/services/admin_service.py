import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException

from sqlalchemy import func, or_

from models.report import Report, ReportStatus
from models.block import Block
from models.user import User
from models.admin_action import AdminAction
from models.user_activity import UserActivity
from models.match import Match
from models.message import Message
from models.photo import Photo
from schemas.admin import ReportCreate, AdminActionCreate, AdminStatsResponse

class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def report_user(self, reporter_id: uuid.UUID, report_in: ReportCreate) -> Report:
        report = Report(
            reporter_id=reporter_id,
            reported_id=report_in.reported_id,
            reason=report_in.reason,
            details=report_in.details
        )
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def block_user(self, blocker_id: uuid.UUID, blocked_id: uuid.UUID) -> Block:
        # Check if already blocked
        qry = select(Block).where(Block.blocker_id == blocker_id, Block.blocked_id == blocked_id)
        existing = (await self.db.execute(qry)).scalars().first()
        if existing:
            return existing

        block = Block(blocker_id=blocker_id, blocked_id=blocked_id)
        self.db.add(block)
        await self.db.commit()
        await self.db.refresh(block)
        return block

    async def get_pending_reports(self, page: int = 1, size: int = 50) -> dict:
        qry = select(Report).where(Report.status == ReportStatus.PENDING)
        count_qry = select(func.count()).select_from(qry.subquery())
        total = (await self.db.execute(count_qry)).scalar()
        
        qry = qry.order_by(Report.created_at.desc()).offset((page - 1) * size).limit(size)
        items = (await self.db.execute(qry)).scalars().all()
        return {"items": items, "total": total, "page": page, "size": size}

    async def get_all_users(self, page: int = 1, size: int = 50, search: str = None) -> dict:
        qry = select(User)
        if search:
            qry = qry.where(User.email.ilike(f"%{search}%"))
            
        count_qry = select(func.count()).select_from(qry.subquery())
        total = (await self.db.execute(count_qry)).scalar()
        
        qry = qry.order_by(User.created_at.desc()).offset((page - 1) * size).limit(size)
        items = (await self.db.execute(qry)).scalars().all()
        return {"items": items, "total": total, "page": page, "size": size}

    async def get_user_activities(self, user_id: uuid.UUID, page: int = 1, size: int = 50) -> dict:
        qry = select(UserActivity).where(UserActivity.user_id == user_id)
        
        count_qry = select(func.count()).select_from(qry.subquery())
        total = (await self.db.execute(count_qry)).scalar()
        
        qry = qry.order_by(UserActivity.created_at.desc()).offset((page - 1) * size).limit(size)
        items = (await self.db.execute(qry)).scalars().all()
        return {"items": items, "total": total, "page": page, "size": size}

    async def get_user_details(self, user_id: uuid.UUID) -> dict | None:
        from models.profile import Profile
        user = await self.db.get(User, user_id)
        if not user:
            return None
            
        from sqlalchemy.orm import selectinload
        profile_qry = select(Profile).options(selectinload(Profile.user).selectinload(User.photos)).where(Profile.user_id == user_id)
        profile = (await self.db.execute(profile_qry)).scalars().first()
        
        if profile:
             setattr(profile, 'photos', getattr(profile.user, 'photos', []))
             
        return {
            "user": user,
            "profile": profile
        }
    
    async def get_statistics(self) -> AdminStatsResponse:
        total_users = (await self.db.execute(select(func.count(User.id)))).scalar()
        active_users = (await self.db.execute(select(func.count(User.id)).where(User.is_active == True))).scalar()
        total_matches = (await self.db.execute(select(func.count(Match.id)))).scalar()
        total_messages = (await self.db.execute(select(func.count(Message.id)))).scalar()
        pending_reports = (await self.db.execute(select(func.count(Report.id)).where(Report.status == ReportStatus.PENDING))).scalar()
        
        return AdminStatsResponse(
            total_users=total_users,
            active_users=active_users,
            total_matches=total_matches,
            total_messages=total_messages,
            pending_reports=pending_reports
        )

    async def delete_photo(self, admin_id: uuid.UUID, photo_id: uuid.UUID):
        photo = await self.db.get(Photo, photo_id)
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
            
        action = AdminAction(admin_id=admin_id, target_user_id=photo.user_id, action_type="delete_photo", reason=f"Deleted photo {photo_id}")
        self.db.add(action)
        await self.db.delete(photo)
        await self.db.commit()
        return {"status": "success"}

    async def delete_message(self, admin_id: uuid.UUID, message_id: uuid.UUID):
        message = await self.db.get(Message, message_id)
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
            
        action = AdminAction(admin_id=admin_id, target_user_id=message.sender_id, action_type="delete_message", reason=f"Deleted message {message_id}")
        self.db.add(action)
        await self.db.delete(message)
        await self.db.commit()
        return {"status": "success"}

    async def take_admin_action(self, admin_id: uuid.UUID, action_in: AdminActionCreate):
        target_user = await self.db.get(User, action_in.target_user_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
            
        action = AdminAction(
            admin_id=admin_id,
            target_user_id=action_in.target_user_id,
            action_type=action_in.action_type,
            reason=action_in.reason
        )
        self.db.add(action)
        
        # Implement specific action logic
        if action_in.action_type == "ban":
            target_user.is_active = False
            self.db.add(target_user)
        elif action_in.action_type == "unban":
            target_user.is_active = True
            self.db.add(target_user)
            
        await self.db.commit()
        await self.db.refresh(action)
        return action
