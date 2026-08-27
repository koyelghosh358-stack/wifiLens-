import httpx
import json
import os
import sys
from windows_scanner import get_raw_scan_output, parse_networks

BASE_URL = "http://127.0.0.1:8000"
CONFIG_FILE = "device_config.json"


def load_device_key() -> str:
    if not os.path.exists(CONFIG_FILE):
        if __name__ == "__main__":
            print("No device registered yet.")
            print("Run 'python register_device.py' first, then try again.")
            sys.exit(1)
        raise FileNotFoundError("Device not registered")

    with open(CONFIG_FILE) as f:
        config = json.load(f)
    return config["api_key"]


def submit_scan(api_key: str, networks: list[dict]) -> dict:
    clean_networks = [
        {k: v for k, v in net.items() if k in (
            "ssid", "bssid", "rssi", "frequency", "channel", "capabilities"
        )}
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
    api_key = load_device_key()

    print("Scanning for nearby Wi-Fi networks...")
    raw = get_raw_scan_output()
    networks = parse_networks(raw)
    print(f"Found {len(networks)} network(s).")

    print("Submitting scan to WiFiLens...")
    result = submit_scan(api_key, networks)

    print(f"\nScan saved! ID: {result['id']}")
    print(f"Networks recorded: {result['network_count']}\n")
    for obs in result["observations"]:
        print(f"{obs['ssid']:15} | {obs['rssi']:5} dBm | {obs['band']:8} | {obs['security_type']:6} | {obs['signal_quality']}")