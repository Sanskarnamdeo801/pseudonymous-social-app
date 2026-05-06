from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType


class NotificationService:
    @staticmethod
    def create(
        db: Session,
        user_id,
        actor_id,
        notification_type: NotificationType,
        message: str,
        payload: dict | None = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            actor_id=actor_id,
            type=notification_type,
            message=message,
            payload=payload or {},
        )
        db.add(notification)
        db.flush()
        return notification

    @staticmethod
    def list_for_user(db: Session, user_id) -> list[Notification]:
        return list(
            db.scalars(select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc()))
        )

    @staticmethod
    def mark_all_read(db: Session, user_id) -> None:
        notifications = db.scalars(select(Notification).where(Notification.user_id == user_id)).all()
        for notification in notifications:
            notification.is_read = True


notification_service = NotificationService()

