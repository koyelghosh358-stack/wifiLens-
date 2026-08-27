import subprocess
import time
import re


def get_raw_scan_output() -> str:
    """Forces Windows to do a fresh Wi-Fi scan by briefly reconnecting, then reads the results."""
    subprocess.run(["netsh", "wlan", "disconnect"], capture_output=True, text=True)
    time.sleep(1)
    subprocess.run(["netsh", "wlan", "connect", "name=Koyel"], capture_output=True, text=True)
    time.sleep(2)
    result = subprocess.run(
        ["netsh", "wlan", "show", "networks", "mode=bssid"],
        capture_output=True,
        text=True,
    )
    return result.stdout


def channel_to_frequency(channel: int, band: str) -> int:
    """Converts a Wi-Fi channel number + band into an approximate frequency in MHz."""
    if "2.4" in band:
        if channel == 14:
            return 2484
        return 2412 + (channel - 1) * 5
    elif "5" in band:
        return 5000 + channel * 5
    elif "6" in band:
        return 5950 + channel * 5
    return 0


def signal_percent_to_rssi(percent: int) -> int:
    """
    Converts Windows' signal percentage into an approximate RSSI in dBm.
    This is a widely-used approximation, not an exact measurement Windows exposes directly.
    """
    return (percent // 2) - 100


def parse_networks(raw_output: str) -> list[dict]:
    """Parses netsh's raw text output into a clean list of network dicts."""
    networks = []
    current_ssid = None
    current_auth = None
    current_encryption = None

    for line in raw_output.splitlines():
        line = line.strip()

        ssid_match = re.match(r"SSID \d+ : (.*)", line)
        if ssid_match:
            current_ssid = ssid_match.group(1).strip()
            continue

        auth_match = re.match(r"Authentication\s*:\s*(.*)", line)
        if auth_match:
            current_auth = auth_match.group(1).strip()
            continue

        enc_match = re.match(r"Encryption\s*:\s*(.*)", line)
        if enc_match:
            current_encryption = enc_match.group(1).strip()
            continue

        bssid_match = re.match(r"BSSID \d+\s*:\s*(.*)", line)
        if bssid_match:
            current_bssid = bssid_match.group(1).strip()
            current_network = {
                "ssid": current_ssid if current_ssid else None,
                "bssid": current_bssid,
                "capabilities": f"[{current_auth}-{current_encryption}][ESS]",
            }
            networks.append(current_network)
            continue

        signal_match = re.match(r"Signal\s*:\s*(\d+)%", line)
        if signal_match and networks:
            networks[-1]["rssi"] = signal_percent_to_rssi(int(signal_match.group(1)))
            continue

        band_match = re.match(r"Band\s*:\s*(.*)", line)
        if band_match and networks:
            networks[-1]["_band"] = band_match.group(1).strip()
            continue

        channel_match = re.match(r"Channel\s*:\s*(\d+)", line)
        if channel_match and networks:
            channel = int(channel_match.group(1))
            band = networks[-1].get("_band", "2.4 GHz")
            networks[-1]["channel"] = channel
            networks[-1]["frequency"] = channel_to_frequency(channel, band)
            networks[-1].pop("_band", None)
            continue

    seen = set()
    deduped = []
    for net in networks:
        key = net.get("bssid")
        if key not in seen:
            seen.add(key)
            deduped.append(net)
    return deduped
if __name__ == "__main__":
    raw = get_raw_scan_output()
    parsed = parse_networks(raw)
    print(f"Found {len(parsed)} network(s):\n")
    for net in parsed:
        print(net)