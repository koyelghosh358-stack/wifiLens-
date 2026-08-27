import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load variables from backend/.env into the environment
load_dotenv()

# DATABASE_URL:
#   Local dev (SQLite, zero setup): sqlite:///./wifilens.db
#   Production (Postgres):          postgresql+psycopg://user:password@host/wifilens
#
# Prefer the pooled Postgres connection if available (better for FastAPI's
# frequent open/close connection pattern), otherwise fall back to a direct
# connection, otherwise fall back to local SQLite if neither is set.
DATABASE_URL = (
    os.getenv("DATABASE_URL_POOLED")
    or os.getenv("DATABASE_URL")
    or "sqlite:///./wifilens.db"
)

# SQLAlchemy needs the "+psycopg" driver hint for Postgres URLs.
# Neon gives URLs starting with "postgresql://" — we upgrade that automatically.
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

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