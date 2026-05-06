from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self) -> None:
        self._settings = get_settings()

    def is_configured(self) -> bool:
        return self._settings.smtp_configured

    def send_email(self, *, recipient: str, subject: str, body: str) -> None:
        if not self.is_configured():
            logger.info("SMTP not configured; skipping email delivery.")
            return

        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = self._settings.smtp_from
        message["To"] = recipient
        message.set_content(body)

        with smtplib.SMTP(self._settings.smtp_host, self._settings.smtp_port, timeout=20) as server:
            if self._settings.smtp_use_tls:
                server.starttls()
            if self._settings.smtp_user and self._settings.smtp_password:
                server.login(self._settings.smtp_user, self._settings.smtp_password)
            server.send_message(message)

    def send_welcome_email(self, *, recipient: str, handle: str) -> None:
        subject = "Welcome to VeilSpeak"
        body = (
            f"Hi @{handle},\n\n"
            "Welcome to VeilSpeak.\n"
            "Your account is ready and you can now sign in to start posting.\n\n"
            "If you did not create this account, please ignore this email.\n"
        )
        self.send_email(recipient=recipient, subject=subject, body=body)

    def send_welcome_email_safely(self, *, recipient: str, handle: str) -> None:
        try:
            self.send_welcome_email(recipient=recipient, handle=handle)
        except Exception:
            logger.exception("Failed to send welcome email")


email_service = EmailService()
