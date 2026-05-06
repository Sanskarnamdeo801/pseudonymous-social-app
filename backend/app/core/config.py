from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from dotenv import load_dotenv
from pydantic import Field, computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_ROOT.parent

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BACKEND_ROOT / ".env")


def _parse_origin_list(raw_value: str) -> List[str]:
    value = raw_value.strip()
    if not value:
        return []

    if "](" in value and value.startswith("[") and value.endswith(")"):
        value = value[1 : value.index("](")]
    elif value.startswith("[") and value.endswith("]"):
        value = value[1:-1]

    return [origin.strip() for origin in value.split(",") if origin.strip()]


def _ensure_postgres_sslmode(database_url: str) -> str:
    if not database_url or not database_url.startswith("postgresql"):
        return database_url

    parts = urlsplit(database_url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query.setdefault("sslmode", "require")
    return urlunsplit(parts._replace(query=urlencode(query)))


def _redact_database_url(database_url: str) -> str:
    if not database_url:
        return "<unset>"

    parts = urlsplit(database_url)
    if "@" not in parts.netloc:
        return database_url

    credentials, host = parts.netloc.rsplit("@", 1)
    username = credentials.split(":", 1)[0]
    safe_netloc = f"{username}:***@{host}" if username else f"***@{host}"
    return urlunsplit(parts._replace(netloc=safe_netloc))


class Settings(BaseSettings):
    app_name: str = "VeilSpeak"
    app_env: str = "production"
    app_debug: bool = False
    secret_key: str = Field(default="")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 20
    refresh_token_expire_days: int = 14
    database_url: str = Field(default="")
    redis_url: str | None = None
    backend_cors_origins: str = "http://localhost:5173,https://sanskarnamdeo801.github.io"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None
    smtp_use_tls: bool = True
    email_encryption_key: str = "cZx5mvfuk6hYk6H7AnqH-5VQ0K6T4O3v1s6J8Zq9QxI="
    ip_hash_pepper: str = "replace-with-dev-pepper"
    auto_flag_keywords: str = "violence,terrorism,doxx,credit card,ssn"
    rate_limit_window_seconds: int = 60
    rate_limit_auth_requests: int = 10
    rate_limit_write_requests: int = 30
    rate_limit_read_requests: int = 120

    model_config = SettingsConfigDict(
        env_file=(PROJECT_ROOT / ".env", BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @computed_field
    @property
    def cors_origins(self) -> List[str]:
        return _parse_origin_list(self.backend_cors_origins)

    @computed_field
    @property
    def auto_flag_terms(self) -> List[str]:
        return [term.strip().lower() for term in self.auto_flag_keywords.split(",") if term.strip()]

    @computed_field
    @property
    def normalized_database_url(self) -> str:
        normalized = self.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        return _ensure_postgres_sslmode(normalized)

    @computed_field
    @property
    def safe_database_url(self) -> str:
        return _redact_database_url(self.normalized_database_url)

    @computed_field
    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_password and self.smtp_from)

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.app_env.lower() == "production":
            if not self.secret_key:
                raise ValueError("SECRET_KEY must be set in production.")
            if not self.database_url:
                raise ValueError("DATABASE_URL must be set in production.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
