from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UserPublic(BaseModel):
    id: UUID
    handle: str
    bio: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserProfile(UserPublic):
    is_searchable: bool
    post_count: int = 0


class AccountSettingsResponse(UserProfile):
    show_activity_status: bool
    blur_sensitive_content: bool
    email_notifications: bool
    filtered_keywords: list[str]


class AccountSettingsUpdate(BaseModel):
    handle: str | None = Field(default=None, min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    bio: str | None = Field(default=None, max_length=280)


class PrivacySettingsUpdate(BaseModel):
    is_searchable: bool
    show_activity_status: bool
    email_notifications: bool


class SafetySettingsUpdate(BaseModel):
    blur_sensitive_content: bool
    filtered_keywords: list[str] = Field(default_factory=list)
