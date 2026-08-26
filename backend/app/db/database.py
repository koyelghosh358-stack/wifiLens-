import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# DATABASE_URL:
#   Local dev (SQLite, zero setup): sqlite:///./wifilens.db
#   Production (Postgres, later):   postgresql+psycopg://user:password@host:5432/wifilens
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wifilens.db")

# SQLite needs this extra flag; Postgres doesn't, so we only add it conditionally.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Used by FastAPI routes to get a database session, and auto-closes it after each request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()