from app.services.signal_analysis import classify_rssi, frequency_to_band, frequency_to_channel, parse_security

print(classify_rssi(-42))              # expect: Excellent
print(classify_rssi(-75))              # expect: Weak
print(frequency_to_band(5180))         # expect: 5GHz
print(frequency_to_band(2437))         # expect: 2.4GHz
print(frequency_to_channel(5180))      # expect: 36
print(frequency_to_channel(2412))      # expect: 1
print(parse_security("[WPA2-PSK-CCMP][ESS]"))  # expect: WPA2
print(parse_security(None))            # expect: Open