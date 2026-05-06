from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, Request, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.redis import get_redis_client
from app.core.security import create_token, decode_token, get_request_ip, hash_jti, hash_password, verify_password
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import TokenPair
from app.services.crypto_service import crypto_service


class AuthService:
    def signup(self, db: Session, request, fastapi_request: Request) -> User:
        existing = db.scalar(select(User).where(User.handle == request.handle.lower()))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Handle already taken")
        user = User(
            handle=request.handle.lower(),
            email_encrypted=crypto_service.encrypt_email(request.email),
            password_hash=hash_password(request.password),
            ip_hash=crypto_service.hash_ip_address(get_request_ip(fastapi_request)),
        )
        db.add(user)
        db.flush()
        return user

    def authenticate(self, db: Session, handle: str, password: str) -> User:
        user = db.scalar(select(User).where(User.handle == handle.lower()))
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if user.is_banned:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account banned")
        user.last_login_at = datetime.now(UTC)
        return user

    def issue_tokens(self, db: Session, user: User, request: Request) -> TokenPair:
        settings = get_settings()
        access = create_token(
            subject=str(user.id),
            token_type="access",
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
            extra={"handle": user.handle, "is_admin": user.is_admin},
        )
        refresh = create_token(
            subject=str(user.id),
            token_type="refresh",
            expires_delta=timedelta(days=settings.refresh_token_expire_days),
        )
        refresh_payload = decode_token(refresh)
        jti_hash = hash_jti(refresh_payload["jti"])
        expires_at = datetime.fromtimestamp(refresh_payload["exp"], tz=UTC)
        refresh_record = RefreshToken(
            user_id=user.id,
            jti_hash=jti_hash,
            user_agent=request.headers.get("user-agent", ""),
            ip_hash=crypto_service.hash_ip_address(get_request_ip(request)),
            expires_at=expires_at,
        )
        db.add(refresh_record)
        redis_client = get_redis_client()
        try:
            ttl = int((expires_at - datetime.now(UTC)).total_seconds())
            redis_client.setex(f"session:{jti_hash}", ttl, str(user.id))
        except Exception:
            pass
        return TokenPair(access_token=access, refresh_token=refresh)

    def refresh_tokens(self, db: Session, refresh_token: str, request: Request) -> TokenPair:
        try:
            payload = decode_token(refresh_token)
        except JWTError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token type")
        jti_hash = hash_jti(payload["jti"])
        token_record = db.scalar(select(RefreshToken).where(RefreshToken.jti_hash == jti_hash))
        if not token_record or token_record.revoked_at or token_record.expires_at <= datetime.now(UTC):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
        user = db.get(User, UUID(payload["sub"]))
        if not user or user.is_banned:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account unavailable")
        token_record.revoked_at = datetime.now(UTC)
        return self.issue_tokens(db, user, request)

    def revoke_refresh_token(self, db: Session, refresh_token: str) -> None:
        payload = decode_token(refresh_token)
        jti_hash = hash_jti(payload["jti"])
        token_record = db.scalar(select(RefreshToken).where(RefreshToken.jti_hash == jti_hash))
        if token_record and not token_record.revoked_at:
            token_record.revoked_at = datetime.now(UTC)
        try:
            get_redis_client().delete(f"session:{jti_hash}")
        except Exception:
            pass


auth_service = AuthService()

