from __future__ import annotations

from cryptography.fernet import Fernet

from app.core.config import get_settings
from app.core.security import hash_ip


class CryptoService:
    def __init__(self) -> None:
        settings = get_settings()
        self._fernet = Fernet(settings.email_encryption_key)

    def encrypt_email(self, email: str) -> str:
        return self._fernet.encrypt(email.lower().encode("utf-8")).decode("utf-8")

    def decrypt_email(self, ciphertext: str) -> str:
        return self._fernet.decrypt(ciphertext.encode("utf-8")).decode("utf-8")

    @staticmethod
    def hash_ip_address(ip_address: str) -> str:
        return hash_ip(ip_address)


crypto_service = CryptoService()

