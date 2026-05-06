from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate, ReportResponse
from app.services.moderation_service import moderation_service

router = APIRouter()
settings = get_settings()


@router.post("", response_model=ReportResponse, dependencies=[rate_limit(settings.rate_limit_write_requests, settings.rate_limit_window_seconds)])
def create_report(
    payload: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    report = moderation_service.create_report(
        db=db,
        reporter_id=current_user.id,
        target_type=payload.target_type,
        target_id=payload.target_id,
        reason=payload.reason,
        details=payload.details,
    )
    if payload.target_type.value == "user":
        moderation_service.maybe_escalate_auto_ban(db, payload.target_id)
    db.commit()
    db.refresh(report)
    return ReportResponse.model_validate(report)


@router.get("/mine", response_model=list[ReportResponse], dependencies=[rate_limit(settings.rate_limit_read_requests, settings.rate_limit_window_seconds)])
def my_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ReportResponse]:
    reports = db.scalars(select(Report).where(Report.reporter_id == current_user.id).order_by(Report.created_at.desc())).all()
    return [ReportResponse.model_validate(report) for report in reports]
