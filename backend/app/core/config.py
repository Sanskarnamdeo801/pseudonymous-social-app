from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from dotenv import load_dotenv
from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_ROOT.parent

load_dotenv(BACKEND_ROOT / ".env")
load_dotenv(PROJECT_ROOT / ".env")


def _parse_origin_list(raw_value: str) -> List[str]:
    value = raw_value.strip()
    if not value:
        return []

    # Tolerate markdown-style copy/paste like [http://a,http://b](http://a,http://b).
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


class Settings(BaseSettings):
    app_name: str = "VeilSpeak"
    app_env: str = "production"
    app_debug: bool = False
    secret_key: str = "change-me-dev-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 20
    refresh_token_expire_days: int = 14
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/veilspeak?sslmode=require"
    )
    redis_url: str = "redis://localhost:6379/0"
    backend_cors_origins: str = "http://localhost:5173,https://sanskarnamdeo801.github.io"
    email_encryption_key: str = "cZx5mvfuk6hYk6H7AnqH-5VQ0K6T4O3v1s6J8Zq9QxI="
    ip_hash_pepper: str = "replace-with-dev-pepper"
    auto_flag_keywords: str = "violence,terrorism,doxx,credit card,ssn"
    rate_limit_window_seconds: int = 60
    rate_limit_auth_requests: int = 10
    rate_limit_write_requests: int = 30
    rate_limit_read_requests: int = 120

    model_config = SettingsConfigDict(
        env_file=(BACKEND_ROOT / ".env", PROJECT_ROOT / ".env"),
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
        return _ensure_postgres_sslmode(self.database_url)


@lru_cache
def get_settings() -> Settings:
    return Settings()
