from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserPublic


class PostCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    content: str = Field(min_length=1, max_length=5000)


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    parent_id: str | None = None


class CommentResponse(BaseModel):
    id: UUID
    content: str
    depth: int
    auto_flagged: bool
    created_at: datetime
    author: UserPublic
    replies: list["CommentResponse"] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class PostResponse(BaseModel):
    id: UUID
    title: str
    content: str
    auto_flagged: bool
    like_count: int
    comment_count: int
    engagement_score: float
    created_at: datetime
    author: UserPublic
    liked_by_viewer: bool = False

    model_config = ConfigDict(from_attributes=True)


class PostDetailResponse(PostResponse):
    comments: list[CommentResponse]


class FeedResponse(BaseModel):
    items: list[PostResponse]
    mode: str


class LikeResponse(BaseModel):
    liked: bool
    like_count: int


CommentResponse.model_rebuild()
