import httpx

BASE = "http://127.0.0.1:8000"

# 1. Register a fresh test user
reg = httpx.post(f"{BASE}/api/v1/auth/register", json={
        "email": "scan-test4@wifilens.com",
    "password": "testpass123",
    "name": "Test"
})
reg.raise_for_status()
token = reg.json()["access_token"]
print("Registered, got token.")

# 2. Submit a scan with 3 realistic networks
scan_payload = {
    "networks": [
        {"ssid": "HomeNet_5G", "bssid": "AA:BB:CC:11:22:33", "rssi": -44, "frequency": 5180, "channel": 36, "capabilities": "[WPA2-PSK-CCMP][ESS]"},
        {"ssid": "OfficeWifi", "bssid": "DD:EE:FF:44:55:66", "rssi": -61, "frequency": 2437, "channel": 6, "capabilities": "[SAE][ESS]"},
        {"ssid": "CafeGuest", "bssid": "11:22:33:AA:BB:CC", "rssi": -78, "frequency": 2412, "channel": 1, "capabilities": "[ESS]"},
    ]
}

scan = httpx.post(
    f"{BASE}/api/v1/scans",
    json=scan_payload,
    headers={"Authorization": f"Bearer {token}"}
)
scan.raise_for_status()
result = scan.json()

print(f"\nScan created: {result['id']}")
print(f"Network count: {result['network_count']}\n")

for obs in result["observations"]:
    print(f"{obs['ssid']:15} | {obs['rssi']:5} dBm | {obs['band']:8} | ch{str(obs['channel']):4} | {obs['security_type']:6} | {obs['signal_quality']}")