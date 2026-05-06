from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, AuthUser, LoginRequest, RefreshRequest, SignUpRequest
from app.services.auth_service import auth_service
from app.services.crypto_service import crypto_service
from app.services.email_service import email_service

router = APIRouter()
settings = get_settings()


@router.post("/signup", response_model=AuthResponse, dependencies=[rate_limit(settings.rate_limit_auth_requests, settings.rate_limit_window_seconds)])
def signup(payload: SignUpRequest, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    user = auth_service.signup(db, payload, request)
    tokens = auth_service.issue_tokens(db, user, request)
    db.commit()
    db.refresh(user)
    if user.email_notifications:
        email_service.send_welcome_email_safely(
            recipient=crypto_service.decrypt_email(user.email_encrypted),
            handle=user.handle,
        )
    return AuthResponse(user=user, tokens=tokens)


@router.post("/login", response_model=AuthResponse, dependencies=[rate_limit(settings.rate_limit_auth_requests, settings.rate_limit_window_seconds)])
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    user = auth_service.authenticate(db, payload.handle, payload.password)
    tokens = auth_service.issue_tokens(db, user, request)
    db.commit()
    db.refresh(user)
    return AuthResponse(user=user, tokens=tokens)


@router.post("/refresh", response_model=AuthResponse, dependencies=[rate_limit(settings.rate_limit_auth_requests, settings.rate_limit_window_seconds)])
def refresh(payload: RefreshRequest, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    tokens = auth_service.refresh_tokens(db, payload.refresh_token, request)
    user = get_current_user(tokens.access_token, db)
    db.commit()
    return AuthResponse(user=user, tokens=tokens)


@router.post("/logout")
def logout(payload: RefreshRequest, db: Session = Depends(get_db)) -> dict:
    auth_service.revoke_refresh_token(db, payload.refresh_token)
    db.commit()
    return {"message": "Logged out"}


@router.get("/me", response_model=AuthUser)
def me(current_user: User = Depends(get_current_user)) -> AuthUser:
    return AuthUser.model_validate(current_user)
