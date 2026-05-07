from __future__ import annotations

import logging
import platform
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.middleware.security_headers import SecurityHeadersMiddleware

# ✅ ADD THESE IMPORTS
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.services.auth_service import auth_service


settings = get_settings()
configure_logging(settings.app_debug)
logger = logging.getLogger(__name__)

origins = settings.cors_origins or [
    "http://localhost:5173",
    "https://sanskarnamdeo801.github.io",
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    # 🔥 CREATE TABLES ON STARTUP (FIX YOUR ERROR)
    try:
        logger.info("Creating database tables if not exist...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ready ✅")
    except Exception as e:
        logger.error("DB init failed ❌", exc_info=e)

    db = SessionLocal()
    try:
        auth_service.ensure_default_admin(db)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("Default admin bootstrap failed", exc_info=e)
    finally:
        db.close()

    logger.info("Python runtime: %s", platform.python_version())
    logger.info("DATABASE_URL: %s", settings.safe_database_url)
    logger.info("Redis configured: %s", bool(settings.redis_url))
    logger.info("SMTP configured: %s", settings.smtp_configured)

    yield


app = FastAPI(
    title=f"{settings.app_name} API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Security headers
app.add_middleware(SecurityHeadersMiddleware)

# ✅ Routes
app.include_router(api_router, prefix="/api/v1")


# ✅ Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Validation failed"},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ✅ Health routes
@app.get("/")
def root() -> dict:
    return {"status": "ok"}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}
