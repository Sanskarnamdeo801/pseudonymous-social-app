from __future__ import annotations

import json
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.redis import get_redis_client
from app.models.like import Like
from app.models.post import Post


class FeedService:
    @staticmethod
    def _serialize_posts(posts: Iterable[Post]) -> str:
        return json.dumps(
            [
                {
                    "id": str(post.id),
                    "title": post.title,
                    "content": post.content,
                    "auto_flagged": post.auto_flagged,
                    "like_count": post.like_count,
                    "comment_count": post.comment_count,
                    "engagement_score": post.engagement_score,
                    "created_at": post.created_at.isoformat(),
                    "author": {
                        "id": str(post.author.id),
                        "handle": post.author.handle,
                        "bio": post.author.bio,
                        "created_at": post.author.created_at.isoformat(),
                    },
                }
                for post in posts
            ]
        )

    @staticmethod
    def _base_query():
        return select(Post).where(Post.deleted_at.is_(None)).options(joinedload(Post.author))

    def get_feed(self, db: Session, user_id, mode: str) -> list[Post] | list[dict]:
        cache_key = f"feed:{mode}:{user_id}"
        try:
            redis_client = get_redis_client()
            if redis_client is None:
                raise RuntimeError("Redis is not configured")
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass

        order_clause = Post.created_at.desc() if mode == "chronological" else Post.engagement_score.desc()
        posts = list(db.scalars(self._base_query().order_by(order_clause).limit(50)).unique().all())
        try:
            redis_client = get_redis_client()
            if redis_client is None:
                raise RuntimeError("Redis is not configured")
            redis_client.setex(cache_key, 60, self._serialize_posts(posts))
        except Exception:
            pass
        return posts

    @staticmethod
    def annotate_like_state(db: Session, posts: list[Post] | list[dict], user_id) -> dict[str, bool]:
        if not posts:
            return {}
        post_ids = [post["id"] if isinstance(post, dict) else post.id for post in posts]
        liked = db.scalars(select(Like.post_id).where(Like.user_id == user_id, Like.post_id.in_(post_ids))).all()
        return {str(post_id): True for post_id in liked}

    @staticmethod
    def invalidate_user_feeds(user_id) -> None:
        try:
            redis_client = get_redis_client()
            if redis_client is None:
                raise RuntimeError("Redis is not configured")
            for mode in ("chronological", "trending"):
                redis_client.delete(f"feed:{mode}:{user_id}")
        except Exception:
            pass


feed_service = FeedService()
