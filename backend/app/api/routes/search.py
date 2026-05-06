from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostResponse
from app.schemas.user import UserPublic

router = APIRouter()
settings = get_settings()


@router.get("", dependencies=[rate_limit(settings.rate_limit_read_requests, settings.rate_limit_window_seconds)])
def search(query: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    posts = db.scalars(
        select(Post)
        .where(Post.deleted_at.is_(None), or_(Post.title.ilike(f"%{query}%"), Post.content.ilike(f"%{query}%")))
        .limit(20)
    ).all()
    users = db.scalars(
        select(User).where(User.is_searchable.is_(True), User.handle.ilike(f"%{query}%")).limit(20)
    ).all()
    return {
        "query": query,
        "posts": [PostResponse.model_validate(post) for post in posts],
        "users": [UserPublic.model_validate(user) for user in users if user.id != current_user.id or user.is_searchable],
    }
