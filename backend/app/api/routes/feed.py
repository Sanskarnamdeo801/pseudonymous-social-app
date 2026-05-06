from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.post import FeedResponse, PostResponse
from app.services.feed_service import feed_service

router = APIRouter()
settings = get_settings()


def _build_post_response(posts, like_state):
    items = []
    for post in posts:
        item = PostResponse.model_validate(post)
        post_id = post["id"] if isinstance(post, dict) else str(post.id)
        item.liked_by_viewer = like_state.get(post_id, False)
        items.append(item)
    return items


@router.get("/chronological", response_model=FeedResponse, dependencies=[rate_limit(settings.rate_limit_read_requests, settings.rate_limit_window_seconds)])
def chronological_feed(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FeedResponse:
    posts = feed_service.get_feed(db, current_user.id, "chronological")
    like_state = feed_service.annotate_like_state(db, posts, current_user.id)
    return FeedResponse(items=_build_post_response(posts, like_state), mode="chronological")


@router.get("/trending", response_model=FeedResponse, dependencies=[rate_limit(settings.rate_limit_read_requests, settings.rate_limit_window_seconds)])
def trending_feed(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FeedResponse:
    posts = feed_service.get_feed(db, current_user.id, "trending")
    like_state = feed_service.annotate_like_state(db, posts, current_user.id)
    return FeedResponse(items=_build_post_response(posts, like_state), mode="trending")
