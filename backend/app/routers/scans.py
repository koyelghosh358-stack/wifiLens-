from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import ScanSession, NetworkObservation, User
from app.schemas.schemas import ScanSessionCreate, ScanSessionOut, ScanSessionSummary
from app.services.signal_analysis import classify_rssi, frequency_to_band, parse_security
from app.services.auth import get_current_user, get_scan_principal

router = APIRouter(prefix="/api/v1/scans", tags=["scans"])


@router.post("", response_model=ScanSessionOut, status_code=201)
def create_scan(
    payload: ScanSessionCreate,
    principal=Depends(get_scan_principal),
    db: Session = Depends(get_db),
):
    """Submit a completed scan — a list of real detected networks."""
    user, device = principal

    session = ScanSession(
        user_id=user.id,
        device_id=device.id if device else None,
        network_count=len(payload.networks),
    )
    db.add(session)
    db.flush()

    for net in payload.networks:
        obs = NetworkObservation(
            scan_session_id=session.id,
            ssid=net.ssid,
            bssid=net.bssid,
            rssi=net.rssi,
            frequency=net.frequency,
            band=frequency_to_band(net.frequency),
            channel=net.channel,
            capabilities=net.capabilities,
            security_type=parse_security(net.capabilities),
            signal_quality=classify_rssi(net.rssi),
        )
        db.add(obs)

    if device:
        device.last_seen = datetime.now(timezone.utc)

    db.commit()
    db.refresh(session)
    return session


@router.get("", response_model=List[ScanSessionSummary])
def list_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all scan sessions belonging to the logged-in user, most recent first."""
    return (
        db.query(ScanSession)
        .filter(ScanSession.user_id == current_user.id)
        .order_by(ScanSession.created_at.desc())
        .all()
    )


@router.get("/{scan_id}", response_model=ScanSessionOut)
def get_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full detail (all networks) for one specific scan."""
    session = (
        db.query(ScanSession)
        .filter(ScanSession.id == scan_id, ScanSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail=f"Scan session '{scan_id}' not found")
    return session