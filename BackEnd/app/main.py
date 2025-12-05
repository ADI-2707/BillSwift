from fastapi import FastAPI
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app import models
from app.routers.auth import router as auth_router
from app.routers.product import router as product_router
from app.routers.bill import router as bill_router
from app.routers.user_admin import router as admin_user_router
from app import models
from fastapi.middleware.cors import CORSMiddleware

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)

    app.include_router(auth_router)
    app.include_router(product_router)
    app.include_router(bill_router)
    app.include_router(admin_user_router)

    @app.get("/health", tags=["system"])
    async def health_check():
        return {"status": "ok", "env": settings.APP_ENV}
    return app

app = create_app()