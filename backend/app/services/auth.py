import os
import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User

# In a real deployment this secret must come from an environment variable,
# never hard-coded. For local dev, this default is fine.
JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-insecure-secret-change-me")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # tokens last 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    """Creates a signed token containing the user's ID, valid for 7 days."""
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> str:
    """Verifies a token's signature and expiry, and returns the user ID inside it."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    A reusable FastAPI dependency — attach this to any route that should
    require login. It reads the 'Authorization: Bearer <token>' header,
    verifies it, and returns the actual User row from the database.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Include 'Authorization: Bearer <token>'",
        )
    user_id = decode_access_token(credentials.credentials)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user
from fastapi import Header
from typing import Optional, Tuple
from app.models.models import Device


def get_scan_principal(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    x_device_key: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Tuple[User, Optional[Device]]:
    """
    Used specifically for scan submission. Accepts EITHER:
    - a normal user JWT (for manual/testing use via /docs), or
    - a device's X-Device-Key header (for the local scanner agent)
    Returns (user, device) — device is None if authenticated via JWT.
    """
    if x_device_key:
        device = db.query(Device).filter(Device.api_key == x_device_key).first()
        if not device:
            raise HTTPException(status_code=401, detail="Invalid device API key")
        user = db.query(User).filter(User.id == device.user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Device owner no longer exists")
        return user, device

    if credentials:
        user_id = decode_access_token(credentials.credentials)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User no longer exists")
        return user, None

    raise HTTPException(
        status_code=401,
        detail="Authenticate with either 'Authorization: Bearer <token>' or 'X-Device-Key: <key>'",
    )