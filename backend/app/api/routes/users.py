from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.post import Post
from app.models.user import User
from app.schemas.user import UserProfile

router = APIRouter()
settings = get_settings()


@router.get("/{handle}", response_model=UserProfile, dependencies=[rate_limit(settings.rate_limit_read_requests, settings.rate_limit_window_seconds)])
def get_profile(handle: str, viewer: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserProfile:
    user = db.scalar(select(User).where(User.handle == handle.lower()))
    if not user or user.is_banned:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_searchable and user.id != viewer.id and not viewer.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Profile is private")
    post_count = db.scalar(select(func.count(Post.id)).where(Post.author_id == user.id, Post.deleted_at.is_(None))) or 0
    profile = UserProfile.model_validate(user)
    profile.post_count = post_count
    return profile

