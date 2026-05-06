from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.report import Report, ReportStatus
from app.models.user import User
from app.services.notification_service import notification_service
from app.models.notification import NotificationType


class ModerationService:
    @staticmethod
    def should_auto_flag(content: str) -> bool:
        lowered = content.lower()
        return any(term in lowered for term in get_settings().auto_flag_terms)

    @staticmethod
    def create_report(db: Session, reporter_id: UUID, target_type, target_id: UUID, reason: str, details: str) -> Report:
        report = Report(
            reporter_id=reporter_id,
            target_type=target_type,
            target_id=target_id,
            reason=reason,
            details=details,
        )
        db.add(report)
        db.flush()
        return report

    @staticmethod
    def maybe_escalate_auto_ban(db: Session, target_user_id: UUID) -> None:
        open_reports = db.scalar(
            select(func.count(Report.id)).where(Report.target_id == target_user_id, Report.status == ReportStatus.open)
        )
        if open_reports and open_reports >= 5:
            user = db.get(User, target_user_id)
            if user:
                user.is_banned = True

    @staticmethod
    def resolve_report(db: Session, report_id: UUID, admin_user: User, status_value: ReportStatus, note: str) -> Report:
        report = db.get(Report, report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        report.status = status_value
        report.assigned_admin_id = admin_user.id
        report.resolution_note = note
        report.resolved_at = datetime.now(UTC)
        notification_service.create(
            db=db,
            user_id=report.reporter_id,
            actor_id=admin_user.id,
            notification_type=NotificationType.report_update,
            message=f"Your report on {report.target_type.value} has been {status_value.value}.",
            payload={"report_id": str(report.id)},
        )
        db.flush()
        return report


moderation_service = ModerationService()

