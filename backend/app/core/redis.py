from __future__ import annotations

from functools import lru_cache
from typing import Optional

import redis

from app.core.config import get_settings


@lru_cache
def get_redis_client() -> Optional[redis.Redis]:
    settings = get_settings()
    if not settings.redis_url:
        return None
    return redis.Redis.from_url(settings.redis_url, decode_responses=True)
