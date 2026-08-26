from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import Counter

from app.db.database import get_db
from app.models.models import ScanSession, NetworkObservation, User
from app.schemas.schemas import AnalyticsOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsOut)
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Aggregate statistics across all of the current user's scans."""
    total_scans = (
        db.query(ScanSession).filter(ScanSession.user_id == current_user.id).count()
    )

    all_observations = (
        db.query(NetworkObservation)
        .join(ScanSession, NetworkObservation.scan_session_id == ScanSession.id)
        .filter(ScanSession.user_id == current_user.id)
        .all()
    )

    total_observations = len(all_observations)
    unique_networks = len({obs.bssid for obs in all_observations})

    band_counts = Counter(obs.band for obs in all_observations)
    quality_counts = Counter(obs.signal_quality for obs in all_observations)
    open_count = sum(1 for obs in all_observations if obs.security_type == "Open")
    secured_count = total_observations - open_count

    best_per_network: dict[str, NetworkObservation] = {}
    for obs in all_observations:
        if obs.bssid not in best_per_network or obs.rssi > best_per_network[obs.bssid].rssi:
            best_per_network[obs.bssid] = obs

    strongest = sorted(best_per_network.values(), key=lambda o: o.rssi, reverse=True)[:8]

    return AnalyticsOut(
        total_scans=total_scans,
        total_observations=total_observations,
        unique_networks=unique_networks,
        band_distribution=dict(band_counts),
        excellent_count=quality_counts.get("Excellent", 0),
        good_count=quality_counts.get("Good", 0),
        fair_count=quality_counts.get("Fair", 0),
        weak_count=quality_counts.get("Weak", 0),
        very_weak_count=quality_counts.get("Very Weak", 0),
        open_networks=open_count,
        secured_networks=secured_count,
        strongest_networks=strongest,
    )