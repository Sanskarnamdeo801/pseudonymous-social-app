from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.models.comment import Comment
from app.models.post import Post
from app.models.report import Report, ReportTargetType
from app.models.user import User
from app.services.moderation_service import moderation_service


def _build_session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, class_=Session)
    return session_factory()


def test_auto_flag_detects_banned_terms() -> None:
    assert moderation_service.should_auto_flag("This includes a credit card leak") is True


def test_auto_flag_allows_clean_content() -> None:
    assert moderation_service.should_auto_flag("Ordinary product feedback only") is False


def test_delete_comment_marks_entire_subtree_deleted_and_updates_post_counts() -> None:
    db = _build_session()
    author = User(handle="author", email_encrypted="e", password_hash="p", ip_hash="ip")
    post = Post(author=author, title="Post", content="Body", comment_count=2, engagement_score=3.0)
    parent = Comment(post=post, author=author, content="Parent", depth=0)
    child = Comment(post=post, author=author, content="Child", depth=1, parent=parent)
    db.add_all([author, post, parent, child])
    db.commit()

    moderation_service.delete_comment(db, parent.id)
    db.commit()

    refreshed_post = db.get(Post, post.id)
    comments = db.scalars(select(Comment).where(Comment.post_id == post.id)).all()
    assert refreshed_post is not None
    assert refreshed_post.comment_count == 0
    assert refreshed_post.engagement_score == 0.0
    assert all(comment.deleted_at is not None for comment in comments)


def test_build_admin_report_response_includes_target_context() -> None:
    db = _build_session()
    reporter = User(handle="reporter", email_encrypted="e1", password_hash="p", ip_hash="ip1")
    author = User(handle="writer", email_encrypted="e2", password_hash="p", ip_hash="ip2")
    post = Post(author=author, title="Unsafe post", content="Needs review")
    db.add_all([reporter, author, post])
    db.flush()

    report = Report(
        reporter_id=reporter.id,
        target_type=ReportTargetType.post,
        target_id=post.id,
        reason="Harassment",
        details="Contains abuse",
    )
    db.add(report)
    db.commit()

    payload = moderation_service.build_admin_report_response(db, report)
    assert payload.reporter_handle == "reporter"
    assert payload.target_handle == "writer"
    assert payload.target_title == "Unsafe post"
    assert payload.target_preview == "Needs review"
    assert payload.target_exists is True
    assert payload.target_deleted is False
