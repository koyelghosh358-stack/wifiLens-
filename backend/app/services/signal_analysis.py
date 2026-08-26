from typing import Optional


def classify_rssi(rssi: int) -> str:
    """Convert RSSI (dBm) into a human-friendly quality label."""
    if rssi >= -50:
        return "Excellent"
    elif rssi >= -60:
        return "Good"
    elif rssi >= -70:
        return "Fair"
    elif rssi >= -80:
        return "Weak"
    else:
        return "Very Weak"


def frequency_to_band(frequency_mhz: int) -> str:
    """Determine 2.4GHz / 5GHz / 6GHz band from the raw frequency."""
    if 2400 <= frequency_mhz <= 2495:
        return "2.4GHz"
    if 4900 <= frequency_mhz <= 5895:
        return "5GHz"
    if 5925 <= frequency_mhz <= 7125:
        return "6GHz"
    return "unknown"


def frequency_to_channel(frequency_mhz: int) -> Optional[int]:
    """Standard Wi-Fi frequency -> channel number mapping."""
    if frequency_mhz == 2484:
        return 14
    if 2412 <= frequency_mhz <= 2472:
        return (frequency_mhz - 2412) // 5 + 1
    if 5955 <= frequency_mhz <= 7115:  # 6GHz
        return (frequency_mhz - 5950) // 5
    if 5170 <= frequency_mhz <= 5825:  # 5GHz
        return (frequency_mhz - 5000) // 5
    return None


def parse_security(capabilities: Optional[str]) -> str:
    """Parse a raw OS-provided capabilities string into a simple security label."""
    if not capabilities:
        return "Open"
    caps = capabilities.upper()
    if "WPA3" in caps or "SAE" in caps:
        return "WPA3"
    if "WPA2" in caps or "RSN" in caps:
        return "WPA2"
    if "WPA" in caps:
        return "WPA"
    if "WEP" in caps:
        return "WEP"
    return "Open"