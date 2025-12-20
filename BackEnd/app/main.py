from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.db.base import Base

from app.models.user import User
from app.auth.security import hash_password

from app.routers.auth import router as auth_router
from app.routers.product import router as product_router
from app.routers.bill import router as bill_router
from app.routers.user_admin import router as admin_user_router
from app.routers.admin_bill import router as admin_bill_router
from app.routers.component import admin_router


# -------------------------------------------------
# CREATE DEFAULT ADMIN
# -------------------------------------------------
def create_default_admin():
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == "admin").first()
        if existing_admin:
            logging.info("Admin already exists")
            return

        admin = User(
            first_name="Admin",
            last_name="User",
            email="admin@billswift.com",
            password_hash=hash_password("admin123"),
            employee_code="ADMIN001",
            team="Management",
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        logging.info("🔥 Default Admin Created: admin@billswift.com | admin123")

    except Exception as e:
        logging.error(f"Admin creation failed: {e}")
    finally:
        db.close()


# -------------------------------------------------
# APP FACTORY
# -------------------------------------------------
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
    )

    # ------------------ CORS ------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ------------------ STARTUP ------------------
    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)
        create_default_admin()

    # ------------------ ROUTERS ------------------
    app.include_router(auth_router)
    app.include_router(product_router)
    app.include_router(bill_router)
    app.include_router(admin_user_router)
    app.include_router(admin_bill_router)

    # ✅ COMPONENT ROUTERS (THIS FIXES YOUR ISSUE)
    app.include_router(admin_router)   # /admin/components

    # ------------------ HEALTH ------------------
    @app.get("/health")
    async def health_check():
        return {"status": "ok", "env": settings.APP_ENV}

    return app


app = create_app()