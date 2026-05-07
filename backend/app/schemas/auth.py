from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

PASSWORD_MIN_LENGTH = 6
PASSWORD_MAX_LENGTH = 128


class SignUpRequest(BaseModel):
    email: EmailStr
    handle: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)

    @field_validator("handle")
    @classmethod
    def normalize_handle(cls, value: str) -> str:
        return value.lower()


class LoginRequest(BaseModel):
    handle: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)

    @field_validator("handle")
    @classmethod
    def normalize_handle(cls, value: str) -> str:
        return value.lower()


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthUser(BaseModel):
    id: UUID
    handle: str
    bio: str
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    user: AuthUser
    tokens: TokenPair
