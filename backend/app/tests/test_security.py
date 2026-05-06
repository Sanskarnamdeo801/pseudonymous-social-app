from app.core.security import hash_jti, hash_password, verify_password


def test_password_hash_roundtrip() -> None:
    password = "supersafepassword123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True


def test_hash_jti_is_deterministic() -> None:
    value = "sample-jti"
    assert hash_jti(value) == hash_jti(value)

