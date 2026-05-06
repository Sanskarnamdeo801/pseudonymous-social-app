from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import notification_service

router = APIRouter()
settings = get_settings()


@router.get("", response_model=list[NotificationResponse], dependencies=[rate_limit(settings.rate_limit_read_requests, settings.rate_limit_window_seconds)])
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[NotificationResponse]:
    notifications = notification_service.list_for_user(db, current_user.id)
    return [NotificationResponse.model_validate(item) for item in notifications]


@router.post("/mark-read")
def mark_notifications_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    notification_service.mark_all_read(db, current_user.id)
    db.commit()
    return {"message": "Notifications marked as read"}
