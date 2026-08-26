from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class DeviceRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    platform: str = Field(..., pattern="^(windows|macos|linux)$")


class DeviceOut(BaseModel):
    id: str
    name: str
    platform: str
    api_key: str
    created_at: datetime
    last_seen: Optional[datetime]

    model_config = {"from_attributes": True}


class NetworkObservationIn(BaseModel):
    ssid: Optional[str] = Field(None, max_length=64)
    bssid: str = Field(..., min_length=1, max_length=32)
    rssi: int = Field(..., description="Signal strength in dBm")
    frequency: int = Field(..., gt=0, description="Frequency in MHz")
    channel: Optional[int] = None
    capabilities: Optional[str] = Field(None, max_length=256)


class NetworkObservationOut(BaseModel):
    id: str
    ssid: Optional[str]
    bssid: str
    rssi: int
    frequency: int
    band: str
    channel: Optional[int]
    security_type: Optional[str]
    signal_quality: str
    detected_at: datetime

    model_config = {"from_attributes": True}


class ScanSessionCreate(BaseModel):
    networks: list[NetworkObservationIn] = Field(default_factory=list)


class ScanSessionOut(BaseModel):
    id: str
    created_at: datetime
    network_count: int
    observations: list[NetworkObservationOut] = []

    model_config = {"from_attributes": True}


class ScanSessionSummary(BaseModel):
    id: str
    created_at: datetime
    network_count: int

    model_config = {"from_attributes": True}


class AnalyticsOut(BaseModel):
    total_scans: int
    total_observations: int
    unique_networks: int
    band_distribution: dict
    excellent_count: int
    good_count: int
    fair_count: int
    weak_count: int
    very_weak_count: int
    open_networks: int
    secured_networks: int
    strongest_networks: list[NetworkObservationOut]