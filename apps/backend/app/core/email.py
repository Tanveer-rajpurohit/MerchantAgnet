import smtplib
import asyncio
from email.message import EmailMessage
from app.core.config import settings

async def send_email(to: str, subject: str, html_body: str) -> None:
    def _send():
        if not settings.SMTP_HOST:
            print("SMTP_HOST not set, skipping email sending")
            return
            
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to
        msg.set_content(html_body, subtype="html")

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)

    await asyncio.to_thread(_send)
