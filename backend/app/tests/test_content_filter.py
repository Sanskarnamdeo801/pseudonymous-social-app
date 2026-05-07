from fastapi import HTTPException

from app.core.content_filter import ensure_content_allowed


def test_content_filter_blocks_variations() -> None:
    for value in ("fuck", "f*ck", "fucck", "Fuk", "kill yourself", "biiiiitch", "asshole", "ass-hole"):
        try:
            ensure_content_allowed(value)
        except HTTPException as exc:
            assert exc.status_code == 400
            assert exc.detail == "Inappropriate or abusive content detected."
        else:
            raise AssertionError(f"Expected abusive content to be blocked: {value}")


def test_content_filter_allows_clean_text() -> None:
    ensure_content_allowed("Friendly product feedback only")
    ensure_content_allowed("grape juice and thermal paste")
