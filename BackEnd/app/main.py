from fastapi import FastAPI
from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app import models
from app.routers.auth import router as auth_router
from app.routers.product import router as product_router
from app.routers.bill import router as bill_router
from app.routers.user_admin import router as admin_user_router
from fastapi.middleware.cors import CORSMiddleware
from app.models.user import User
from app.auth.security import hash_password
import logging
from app.routers.admin_bill import router as admin_bill_router

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


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)
        create_default_admin()  # 🚀 Run admin creation AFTER DB creation

    app.include_router(auth_router)
    app.include_router(product_router)
    app.include_router(bill_router)
    app.include_router(admin_user_router)
    app.include_router(admin_bill_router)


    @app.get("/health")
    async def health_check():
        return {"status": "ok", "env": settings.APP_ENV}

    return app


app = create_app()