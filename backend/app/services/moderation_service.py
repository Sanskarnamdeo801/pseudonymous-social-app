from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.comment import Comment
from app.models.post import Post
from app.models.report import Report, ReportStatus
from app.models.user import User
from app.schemas.report import AdminReportResponse
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

    @staticmethod
    def build_admin_report_response(db: Session, report: Report) -> AdminReportResponse:
        reporter = db.get(User, report.reporter_id)
        payload = {
            "id": report.id,
            "target_type": report.target_type,
            "target_id": report.target_id,
            "reason": report.reason,
            "details": report.details,
            "status": report.status,
            "resolution_note": report.resolution_note,
            "created_at": report.created_at,
            "resolved_at": report.resolved_at,
            "reporter_handle": reporter.handle if reporter else "unknown",
            "target_exists": False,
            "target_deleted": False,
        }

        if report.target_type.value == "post":
            post = db.get(Post, report.target_id)
            payload["target_exists"] = post is not None
            if post:
                author = db.get(User, post.author_id)
                payload["target_deleted"] = post.deleted_at is not None
                payload["target_handle"] = author.handle if author else None
                payload["target_title"] = post.title
                payload["target_preview"] = post.content
                payload["target_user_id"] = post.author_id
                payload["target_user_banned"] = author.is_banned if author else None
            return AdminReportResponse.model_validate(payload)

        if report.target_type.value == "comment":
            comment = db.get(Comment, report.target_id)
            payload["target_exists"] = comment is not None
            if comment:
                author = db.get(User, comment.author_id)
                payload["target_deleted"] = comment.deleted_at is not None
                payload["target_handle"] = author.handle if author else None
                payload["target_preview"] = comment.content
                payload["target_post_id"] = comment.post_id
                payload["target_user_id"] = comment.author_id
                payload["target_user_banned"] = author.is_banned if author else None
            return AdminReportResponse.model_validate(payload)

        user = db.get(User, report.target_id)
        payload["target_exists"] = user is not None
        if user:
            payload["target_handle"] = user.handle
            payload["target_preview"] = user.bio
            payload["target_user_id"] = user.id
            payload["target_user_banned"] = user.is_banned
        return AdminReportResponse.model_validate(payload)

    @staticmethod
    def delete_post(db: Session, post_id: UUID) -> Post:
        post = db.get(Post, post_id)
        if not post or post.deleted_at:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        post.deleted_at = datetime.now(UTC)
        db.flush()
        return post

    @staticmethod
    def delete_comment(db: Session, comment_id: UUID) -> Comment:
        comment = db.get(Comment, comment_id)
        if not comment or comment.deleted_at:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

        post = db.get(Post, comment.post_id)
        comments = db.scalars(select(Comment).where(Comment.post_id == comment.post_id)).all()
        children_by_parent: dict[UUID | None, list[Comment]] = {}
        for item in comments:
            children_by_parent.setdefault(item.parent_id, []).append(item)

        deleted_now: list[Comment] = []

        def mark_deleted(node: Comment) -> None:
            if node.deleted_at is not None:
                return
            node.deleted_at = datetime.now(UTC)
            deleted_now.append(node)
            for child in children_by_parent.get(node.id, []):
                mark_deleted(child)

        mark_deleted(comment)
        if post and deleted_now:
            post.comment_count = max(post.comment_count - len(deleted_now), 0)
            post.engagement_score = max(post.engagement_score - (1.5 * len(deleted_now)), 0.0)
        db.flush()
        return comment


moderation_service = ModerationService()
