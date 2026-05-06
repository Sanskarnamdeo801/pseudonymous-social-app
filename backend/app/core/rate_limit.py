from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import Depends, HTTPException, Request, status

from app.core.redis import get_redis_client

_memory_buckets: Dict[str, Deque[float]] = defaultdict(deque)


def _allow_in_memory(key: str, limit: int, window_seconds: int) -> bool:
    now = time.time()
    bucket = _memory_buckets[key]
    while bucket and bucket[0] <= now - window_seconds:
        bucket.popleft()
    if len(bucket) >= limit:
        return False
    bucket.append(now)
    return True


def rate_limit(limit: int, window_seconds: int):
    def dependency(request: Request) -> None:
        client_key = request.client.host if request.client else "anonymous"
        key = f"rl:{request.url.path}:{client_key}"
        try:
            redis_client = get_redis_client()
            current = redis_client.incr(key)
            if current == 1:
                redis_client.expire(key, window_seconds)
            if current > limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please slow down.",
                )
        except HTTPException:
            raise
        except Exception:
            if not _allow_in_memory(key, limit, window_seconds):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please slow down.",
                )

    return Depends(dependency)
