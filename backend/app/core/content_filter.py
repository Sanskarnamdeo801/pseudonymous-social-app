from __future__ import annotations

import re

from fastapi import HTTPException, status

ABUSIVE_CONTENT_DETAIL = "Inappropriate or abusive content detected."


def _compile_word_pattern(pattern: str) -> re.Pattern[str]:
    return re.compile(rf"(?<![a-z0-9])(?:{pattern})(?![a-z0-9])", re.IGNORECASE)


BLOCKED_PATTERNS = (
    _compile_word_pattern(r"f+[\W_]*(?:u+|\*+)[\W_]*c*[\W_]*k+"),
    _compile_word_pattern(r"b+[\W_]*i+[\W_]*t+[\W_]*c+[\W_]*h+"),
    _compile_word_pattern(r"b+[\W_]*a+[\W_]*s+[\W_]*t+[\W_]*a+[\W_]*r+[\W_]*d+"),
    _compile_word_pattern(r"r+[\W_]*a+[\W_]*p+[\W_]*e+"),
    _compile_word_pattern(r"s+[\W_]*u+[\W_]*i+[\W_]*c+[\W_]*i+[\W_]*d+[\W_]*e+"),
    _compile_word_pattern(r"t+[\W_]*e+[\W_]*r+[\W_]*r+[\W_]*o+[\W_]*r+[\W_]*i+[\W_]*s+[\W_]*t+"),
    _compile_word_pattern(r"k+[\W_]*i+[\W_]*l+[\W_]*l+[\W_]*y+[\W_]*o+[\W_]*u+[\W_]*r*[\W_]*s+[\W_]*e+[\W_]*l+[\W_]*f+"),
)


def contains_blocked_content(value: str | None) -> bool:
    if not value:
        return False
    return any(pattern.search(value) for pattern in BLOCKED_PATTERNS)


def ensure_content_allowed(*values: str | None) -> None:
    if any(contains_blocked_content(value) for value in values):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=ABUSIVE_CONTENT_DETAIL)
