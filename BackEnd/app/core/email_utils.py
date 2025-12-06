import smtplib
import pathlib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.models.user import User

# Path to templates folder
TEMPLATE_PATH = pathlib.Path(__file__).parent / "email_templates"

def render_template(template_name: str, **kwargs) -> str:
    """Load HTML template and replace placeholders."""
    base_html_path = TEMPLATE_PATH / "base.html"
    template_path = TEMPLATE_PATH / template_name

    base_html = base_html_path.read_text(encoding="utf-8")
    html = template_path.read_text(encoding="utf-8")

    for key, value in kwargs.items():
        html = html.replace(f"{{{{{key}}}}}", str(value))

    return base_html.replace("{{content}}", html)

def _send_email(to_email: str, subject: str, html: str) -> None:
    """Send HTML email using SMTP or print when config missing."""
    if not (settings.EMAIL_SENDER and settings.EMAIL_PASSWORD and settings.EMAIL_HOST):
        print("\n📭 [EMAIL DRY RUN] (No SMTP Enabled)")
        print("To:", to_email)
        print("Subject:", subject)
        print("HTML:\n", html)
        print("📭 [/EMAIL DRY RUN]\n")
        return

    msg = MIMEMultipart("alternative")
    msg["From"] = settings.EMAIL_SENDER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))

    try:
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        if settings.EMAIL_USE_TLS:
            server.starttls()
        server.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
        server.sendmail(settings.EMAIL_SENDER, to_email, msg.as_string())
        server.quit()
        print(f"[EMAIL SENT] to {to_email}")
    except Exception as e:
        print("[EMAIL ERROR]", e)
        print("Failed HTML:")
        print(html)

def send_new_user_request_email(user: User) -> None:
    """Notify ADMIN — A new user has registered"""
    if not settings.ADMIN_EMAIL:
        print("[SKIP] ADMIN_EMAIL not set")
        return

    html = render_template(
        "new_user_admin.html",
        name=f"{user.first_name} {user.last_name}",
        email=user.email,
        code=user.employee_code,
        team=user.team or "-"
    )

    _send_email(settings.ADMIN_EMAIL,
                "🚨 New User Signup | BillSwift", html)

def send_user_signup_ack_email(user: User) -> None:
    """Notify USER — Registration Received"""
    html = render_template("signup_ack.html", name=user.first_name)

    _send_email(user.email,
                "✔ Registration Received | BillSwift", html)

def send_user_approved_email(user: User) -> None:
    """Notify USER — Approved"""
    html = render_template("user_approved.html", name=user.first_name)

    _send_email(user.email,
                "🎉 Your Account is Approved | BillSwift", html)