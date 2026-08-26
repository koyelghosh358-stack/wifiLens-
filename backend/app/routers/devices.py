from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Device, User
from app.schemas.schemas import DeviceRegister, DeviceOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/v1/devices", tags=["devices"])


@router.post("", response_model=DeviceOut, status_code=201)
def register_device(
    payload: DeviceRegister,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    device = Device(
        user_id=current_user.id,
        name=payload.name,
        platform=payload.platform,
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.get("", response_model=List[DeviceOut])
def list_devices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Device).filter(Device.user_id == current_user.id).all()