from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.report import ReportStatus, ReportTargetType


class ReportCreate(BaseModel):
    target_type: ReportTargetType
    target_id: UUID
    reason: str = Field(min_length=3, max_length=120)
    details: str = Field(default="", max_length=500)


class ReportResolve(BaseModel):
    status: ReportStatus
    resolution_note: str = Field(min_length=3, max_length=500)


class ReportResponse(BaseModel):
    id: UUID
    target_type: ReportTargetType
    target_id: UUID
    reason: str
    details: str
    status: ReportStatus
    resolution_note: str
    created_at: datetime
    resolved_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class AdminReportResponse(ReportResponse):
    reporter_handle: str
    target_handle: str | None = None
    target_title: str = ""
    target_preview: str = ""
    target_post_id: UUID | None = None
    target_user_id: UUID | None = None
    target_exists: bool
    target_deleted: bool
    target_user_banned: bool | None = None
