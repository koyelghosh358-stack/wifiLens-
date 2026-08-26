import httpx
import json
import os

BASE_URL = "http://127.0.0.1:8000"
CONFIG_FILE = "device_config.json"


def main():
    if os.path.exists(CONFIG_FILE):
        print(f"A device is already registered (see {CONFIG_FILE}).")
        print("Delete that file first if you want to register a new one.")
        return

    print("=== Register this computer as a WiFiLens scanner device ===")
    email = input("Your WiFiLens email: ")
    password = input("Your WiFiLens password: ")
    device_name = input("Name for this device (e.g. 'My Laptop'): ")

    print("\nLogging in...")
    login_response = httpx.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": email,
        "password": password,
    })
    login_response.raise_for_status()
    token = login_response.json()["access_token"]
    print("Logged in.")

    print("Registering device...")
    device_response = httpx.post(
        f"{BASE_URL}/api/v1/devices",
        json={"name": device_name, "platform": "windows"},
        headers={"Authorization": f"Bearer {token}"},
    )
    device_response.raise_for_status()
    device = device_response.json()

    with open(CONFIG_FILE, "w") as f:
        json.dump({"api_key": device["api_key"], "device_name": device["name"]}, f, indent=2)

    print(f"\nDevice '{device['name']}' registered successfully!")
    print(f"API key saved to {CONFIG_FILE} — you won't need to log in again.")


if __name__ == "__main__":
    main()