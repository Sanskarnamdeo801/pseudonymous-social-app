from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: UUID
    type: NotificationType
    message: str
    payload: dict
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
