import httpx

BASE = "http://127.0.0.1:8000"

# 1. Register a fresh user
reg = httpx.post(f"{BASE}/api/v1/auth/register", json={
    "email": "analytics-test2@wifilens.com",
    "password": "testpass123",
    "name": "Test"
})
reg.raise_for_status()
token = reg.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("Registered.")

# 2. Submit TWO scans (simulating scanning at different times)
scan1 = {
    "networks": [
        {"ssid": "HomeNet_5G", "bssid": "AA:BB:CC:11:22:33", "rssi": -44, "frequency": 5180, "channel": 36, "capabilities": "[WPA2-PSK-CCMP][ESS]"},
        {"ssid": "OfficeWifi", "bssid": "DD:EE:FF:44:55:66", "rssi": -61, "frequency": 2437, "channel": 6, "capabilities": "[SAE][ESS]"},
    ]
}
httpx.post(f"{BASE}/api/v1/scans", json=scan1, headers=headers).raise_for_status()
print("Scan 1 submitted.")

scan2 = {
    "networks": [
        {"ssid": "HomeNet_5G", "bssid": "AA:BB:CC:11:22:33", "rssi": -40, "frequency": 5180, "channel": 36, "capabilities": "[WPA2-PSK-CCMP][ESS]"},  # same network, stronger signal this time
        {"ssid": "CafeGuest", "bssid": "11:22:33:AA:BB:CC", "rssi": -78, "frequency": 2412, "channel": 1, "capabilities": "[ESS]"},
    ]
}
httpx.post(f"{BASE}/api/v1/scans", json=scan2, headers=headers).raise_for_status()
print("Scan 2 submitted.\n")

# 3. Check /networks — should show 3 UNIQUE networks (HomeNet_5G deduplicated, using latest reading)
networks = httpx.get(f"{BASE}/api/v1/networks", headers=headers)
networks.raise_for_status()
print("=== /networks (should be 3 unique) ===")
for n in networks.json():
    print(f"{n['ssid']:15} | {n['rssi']:5} dBm | {n['band']}")

# 4. Check /analytics
analytics = httpx.get(f"{BASE}/api/v1/analytics", headers=headers)
analytics.raise_for_status()
a = analytics.json()
print("\n=== /analytics ===")
print(f"Total scans: {a['total_scans']}")
print(f"Total observations: {a['total_observations']}")
print(f"Unique networks: {a['unique_networks']}")
print(f"Band distribution: {a['band_distribution']}")
print(f"Excellent: {a['excellent_count']}, Good: {a['good_count']}, Fair: {a['fair_count']}, Weak: {a['weak_count']}")
print(f"Open: {a['open_networks']}, Secured: {a['secured_networks']}")