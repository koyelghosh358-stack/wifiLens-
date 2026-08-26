import uuid
import secrets
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    """Generates a random unique ID string for each new row (instead of 1, 2, 3...)."""
    return str(uuid.uuid4())


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    platform = Column(String, nullable=False)  # "windows" | "macos" | "linux"
    api_key = Column(String, unique=True, nullable=False, default=lambda: secrets.token_urlsafe(32))
    created_at = Column(DateTime, default=utcnow)
    last_seen = Column(DateTime, nullable=True)


class ScanSession(Base):
    __tablename__ = "scan_sessions"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, nullable=False, index=True)
    device_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=utcnow, index=True)
    network_count = Column(Integer, default=0)

    observations = relationship("NetworkObservation", back_populates="scan_session", cascade="all, delete-orphan")


class NetworkObservation(Base):
    __tablename__ = "network_observations"

    id = Column(String, primary_key=True, default=gen_uuid)
    scan_session_id = Column(String, ForeignKey("scan_sessions.id"), nullable=False, index=True)

    ssid = Column(String, nullable=True)          # nullable: hidden networks may have no SSID
    bssid = Column(String, nullable=False, index=True)  # the network's unique hardware address
    rssi = Column(Integer, nullable=False)         # signal strength in dBm, always negative
    frequency = Column(Integer, nullable=False)    # in MHz
    band = Column(String, nullable=False)          # "2.4GHz" | "5GHz" | "6GHz"
    channel = Column(Integer, nullable=True)
    capabilities = Column(String, nullable=True)   # raw security info string
    security_type = Column(String, nullable=True)  # parsed: "WPA2", "WPA3", "Open", etc.
    signal_quality = Column(String, nullable=False)  # "Excellent" | "Good" | "Fair" | "Weak" | "Very Weak"
    detected_at = Column(DateTime, default=utcnow, index=True)

    scan_session = relationship("ScanSession", back_populates="observations")