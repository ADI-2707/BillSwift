from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# For PostgreSQL – no echo in production
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True
)


def get_db():
    """
    Dependency for FastAPI routes.
    Yields a DB session and ensures it's closed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()