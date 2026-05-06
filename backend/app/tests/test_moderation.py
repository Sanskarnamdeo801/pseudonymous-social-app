from app.services.moderation_service import moderation_service


def test_auto_flag_detects_banned_terms() -> None:
    assert moderation_service.should_auto_flag("This includes a credit card leak") is True


def test_auto_flag_allows_clean_content() -> None:
    assert moderation_service.should_auto_flag("Ordinary product feedback only") is False
