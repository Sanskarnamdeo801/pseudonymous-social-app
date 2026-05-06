from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.session import get_db
from app.models.post import Post
from app.models.report import Report, ReportStatus
from app.models.user import User
from app.schemas.report import ReportResolve, ReportResponse
from app.services.moderation_service import moderation_service

router = APIRouter()


@router.get("/dashboard")
def dashboard(_: User = Depends(require_admin), db: Session = Depends(get_db)) -> dict:
    return {
        "users": db.scalar(select(func.count(User.id))) or 0,
        "posts": db.scalar(select(func.count(Post.id)).where(Post.deleted_at.is_(None))) or 0,
        "open_reports": db.scalar(select(func.count(Report.id)).where(Report.status == ReportStatus.open)) or 0,
        "banned_users": db.scalar(select(func.count(User.id)).where(User.is_banned.is_(True))) or 0,
    }


@router.get("/reports", response_model=list[ReportResponse])
def list_reports(_: User = Depends(require_admin), db: Session = Depends(get_db)) -> list[ReportResponse]:
    reports = db.scalars(select(Report).order_by(Report.created_at.desc())).all()
    return [ReportResponse.model_validate(report) for report in reports]


@router.patch("/reports/{report_id}", response_model=ReportResponse)
def resolve_report(
    report_id: UUID,
    payload: ReportResolve,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> ReportResponse:
    report = moderation_service.resolve_report(db, report_id, admin_user, payload.status, payload.resolution_note)
    db.commit()
    db.refresh(report)
    return ReportResponse.model_validate(report)


@router.post("/users/{user_id}/ban")
def ban_user(user_id: UUID, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> dict:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_banned = True
    db.commit()
    return {"message": f"User @{user.handle} banned"}


@router.post("/users/{user_id}/unban")
def unban_user(user_id: UUID, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> dict:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_banned = False
    db.commit()
    return {"message": f"User @{user.handle} unbanned"}

