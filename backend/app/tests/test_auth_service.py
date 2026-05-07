from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.models.user import User
from app.services.auth_service import auth_service


def _build_session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, class_=Session)
    return session_factory()


def test_ensure_default_admin_creates_admin_user() -> None:
    db = _build_session()

    auth_service.ensure_default_admin(db)
    db.commit()

    user = db.scalar(select(User).where(User.handle == "shubhashji"))
    assert user is not None
    assert user.is_admin is True


def test_ensure_default_admin_is_idempotent() -> None:
    db = _build_session()

    auth_service.ensure_default_admin(db)
    auth_service.ensure_default_admin(db)
    db.commit()

    users = db.scalars(select(User).where(User.handle == "shubhashji")).all()
    assert len(users) == 1
