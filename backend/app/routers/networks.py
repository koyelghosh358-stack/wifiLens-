from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.db.database import get_db
from app.models.models import NetworkObservation, ScanSession, User
from app.schemas.schemas import NetworkObservationOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/v1/networks", tags=["networks"])


@router.get("", response_model=List[NetworkObservationOut])
def list_networks(
    band: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the latest observation for each unique network (by BSSID)
    across all of the current user's scans. Optionally filter by band.
    """
    # Find the most recent detected_at time for each BSSID
    latest_times = (
        db.query(
            NetworkObservation.bssid,
            func.max(NetworkObservation.detected_at).label("max_time"),
        )
        .join(ScanSession, NetworkObservation.scan_session_id == ScanSession.id)
        .filter(ScanSession.user_id == current_user.id)
        .group_by(NetworkObservation.bssid)
        .subquery()
    )

    query = (
        db.query(NetworkObservation)
        .join(ScanSession, NetworkObservation.scan_session_id == ScanSession.id)
        .join(
            latest_times,
            (NetworkObservation.bssid == latest_times.c.bssid)
            & (NetworkObservation.detected_at == latest_times.c.max_time),
        )
        .filter(ScanSession.user_id == current_user.id)
    )

    if band:
        query = query.filter(NetworkObservation.band == band)

    return query.order_by(NetworkObservation.rssi.desc()).all()