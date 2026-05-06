from app.core.config import _ensure_postgres_sslmode, _parse_origin_list


def test_parse_origin_list_handles_plain_csv() -> None:
    assert _parse_origin_list("http://localhost:5173,http://localhost:4173") == [
        "http://localhost:5173",
        "http://localhost:4173",
    ]


def test_parse_origin_list_handles_markdown_copypaste() -> None:
    assert _parse_origin_list("[http://localhost:5173,http://localhost:4173](http://localhost:5173,http://localhost:4173)") == [
        "http://localhost:5173",
        "http://localhost:4173",
    ]


def test_ensure_postgres_sslmode_adds_require_when_missing() -> None:
    assert _ensure_postgres_sslmode("postgresql+psycopg://user:pass@db.example.com:5432/app") == (
        "postgresql+psycopg://user:pass@db.example.com:5432/app?sslmode=require"
    )
