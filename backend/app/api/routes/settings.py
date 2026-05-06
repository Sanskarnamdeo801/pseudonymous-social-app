from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import AccountSettingsResponse, AccountSettingsUpdate, PrivacySettingsUpdate, SafetySettingsUpdate

router = APIRouter()


@router.get("/account", response_model=AccountSettingsResponse)
def get_account_settings(current_user: User = Depends(get_current_user)) -> AccountSettingsResponse:
    return AccountSettingsResponse.model_validate(current_user)


@router.put("/account", response_model=AccountSettingsResponse)
def update_account_settings(
    payload: AccountSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountSettingsResponse:
    if payload.handle and payload.handle.lower() != current_user.handle:
        existing = db.scalar(select(User).where(User.handle == payload.handle.lower()))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Handle already taken")
        current_user.handle = payload.handle.lower()
    if payload.bio is not None:
        current_user.bio = payload.bio
    db.commit()
    db.refresh(current_user)
    return AccountSettingsResponse.model_validate(current_user)


@router.put("/privacy", response_model=AccountSettingsResponse)
def update_privacy_settings(
    payload: PrivacySettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountSettingsResponse:
    current_user.is_searchable = payload.is_searchable
    current_user.show_activity_status = payload.show_activity_status
    current_user.email_notifications = payload.email_notifications
    db.commit()
    db.refresh(current_user)
    return AccountSettingsResponse.model_validate(current_user)


@router.put("/safety", response_model=AccountSettingsResponse)
def update_safety_settings(
    payload: SafetySettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountSettingsResponse:
    current_user.blur_sensitive_content = payload.blur_sensitive_content
    current_user.filtered_keywords = payload.filtered_keywords
    db.commit()
    db.refresh(current_user)
    return AccountSettingsResponse.model_validate(current_user)
