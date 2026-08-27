from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import socket
import httpx

from windows_scanner import get_raw_scan_output, parse_networks

BASE_URL = "http://127.0.0.1:8000"
CONFIG_FILE = "device_config.json"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_or_create_device_key(user_token: str) -> str:
    """Reuses the saved device key if present, otherwise auto-registers a new
    device using the person's current website login token."""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            return json.load(f)["api_key"]

    device_name = socket.gethostname()

    response = httpx.post(
        f"{BASE_URL}/api/v1/devices",
        json={"name": device_name, "platform": "windows"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    response.raise_for_status()
    device = response.json()

    with open(CONFIG_FILE, "w") as f:
        json.dump({"api_key": device["api_key"], "device_name": device["name"]}, f, indent=2)

    return device["api_key"]


@app.get("/status")
def status():
    return {"running": True, "device_registered": os.path.exists(CONFIG_FILE)}


@app.post("/scan")
def trigger_scan(authorization: str = Header(None)):
    """Runs a real Wi-Fi scan and submits it under whichever account is
    currently logged into the website, auto-registering this device on first use."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not logged in on the website.")
    user_token = authorization.removeprefix("Bearer ")

    try:
        api_key = get_or_create_device_key(user_token)
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=401, detail="Your login session expired. Please log in again.")

    raw = get_raw_scan_output()
    networks = parse_networks(raw)

    if not networks:
        raise HTTPException(status_code=500, detail="No networks found. Try again.")

    clean_networks = [
        {k: v for k, v in net.items() if k in ("ssid", "bssid", "rssi", "frequency", "channel", "capabilities")}
        for net in networks
    ]

    response = httpx.post(
        f"{BASE_URL}/api/v1/scans",
        json={"networks": clean_networks},
        headers={"X-Device-Key": api_key},
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8765)