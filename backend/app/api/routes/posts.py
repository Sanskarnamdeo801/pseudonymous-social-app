from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

import bleach
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.content_filter import ensure_content_allowed
from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.comment import Comment
from app.models.like import Like
from app.models.notification import NotificationType
from app.models.post import Post
from app.models.user import User
from app.schemas.post import CommentCreate, CommentResponse, LikeResponse, PostCreate, PostDetailResponse, PostResponse
from app.services.feed_service import feed_service
from app.services.moderation_service import moderation_service
from app.services.notification_service import notification_service

router = APIRouter()
settings = get_settings()


def _sanitize(value: str) -> str:
    return bleach.clean(value, tags=[], attributes={}, strip=True).strip()


def _build_comment_tree(comments: list[Comment]) -> list[CommentResponse]:
    index = {}
    roots: list[CommentResponse] = []
    for comment in comments:
        node = CommentResponse.model_validate(comment)
        node.replies = []
        index[str(comment.id)] = node
        if comment.parent_id:
            parent = index.get(str(comment.parent_id))
            if parent:
                parent.replies.append(node)
        else:
            roots.append(node)
    return roots


@router.post("", response_model=PostResponse, dependencies=[rate_limit(settings.rate_limit_write_requests, settings.rate_limit_window_seconds)])
def create_post(payload: PostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostResponse:
    title = _sanitize(payload.title)
    content = _sanitize(payload.content)
    ensure_content_allowed(title, content)
    post = Post(
        author_id=current_user.id,
        title=title,
        content=content,
        auto_flagged=moderation_service.should_auto_flag(payload.title + " " + payload.content),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    feed_service.invalidate_user_feeds(current_user.id)
    return PostResponse.model_validate(post)


@router.get("/{post_id}", response_model=PostDetailResponse, dependencies=[rate_limit(settings.rate_limit_read_requests, settings.rate_limit_window_seconds)])
def get_post(post_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PostDetailResponse:
    post = db.scalar(
        select(Post)
        .where(Post.id == post_id, Post.deleted_at.is_(None))
        .options(joinedload(Post.author), joinedload(Post.comments).joinedload(Comment.author))
    )
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    liked = db.scalar(select(Like).where(Like.post_id == post_id, Like.user_id == current_user.id)) is not None
    response = PostDetailResponse.model_validate(post)
    response.liked_by_viewer = liked
    sorted_comments = sorted(post.comments, key=lambda item: item.created_at)
    response.comments = _build_comment_tree(sorted_comments)
    return response


@router.delete("/{post_id}", dependencies=[rate_limit(settings.rate_limit_write_requests, settings.rate_limit_window_seconds)])
def delete_post(post_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    post = db.get(Post, post_id)
    if not post or post.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    post.deleted_at = datetime.now(UTC)
    db.commit()
    return {"message": "Post deleted"}


@router.post("/{post_id}/like", response_model=LikeResponse, dependencies=[rate_limit(settings.rate_limit_write_requests, settings.rate_limit_window_seconds)])
def toggle_like(post_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> LikeResponse:
    post = db.get(Post, post_id)
    if not post or post.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    existing = db.scalar(select(Like).where(Like.post_id == post_id, Like.user_id == current_user.id))
    if existing:
        db.delete(existing)
        post.like_count = max(post.like_count - 1, 0)
        liked = False
    else:
        like = Like(user_id=current_user.id, post_id=post_id)
        db.add(like)
        post.like_count += 1
        post.engagement_score += 2
        liked = True
        if post.author_id != current_user.id:
            notification_service.create(
                db,
                user_id=post.author_id,
                actor_id=current_user.id,
                notification_type=NotificationType.post_liked,
                message=f"@{current_user.handle} upvoted your post.",
                payload={"post_id": str(post_id)},
            )
    db.commit()
    return LikeResponse(liked=liked, like_count=post.like_count)


@router.post("/{post_id}/comments", response_model=CommentResponse, dependencies=[rate_limit(settings.rate_limit_write_requests, settings.rate_limit_window_seconds)])
def create_comment(
    post_id: UUID,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommentResponse:
    post = db.get(Post, post_id)
    if not post or post.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    content = _sanitize(payload.content)
    ensure_content_allowed(content)
    depth = 0
    parent_id = UUID(payload.parent_id) if payload.parent_id else None
    if parent_id:
        parent = db.get(Comment, parent_id)
        if not parent or parent.post_id != post_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid parent comment")
        depth = parent.depth + 1
    comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        parent_id=parent_id,
        content=content,
        depth=depth,
        auto_flagged=moderation_service.should_auto_flag(payload.content),
    )
    db.add(comment)
    post.comment_count += 1
    post.engagement_score += 1.5
    db.flush()
    if post.author_id != current_user.id:
        notification_service.create(
            db,
            user_id=post.author_id,
            actor_id=current_user.id,
            notification_type=NotificationType.post_replied,
            message=f"@{current_user.handle} commented on your post.",
            payload={"post_id": str(post_id), "comment_id": str(comment.id)},
        )
    db.commit()
    db.refresh(comment)
    return CommentResponse.model_validate(comment)
