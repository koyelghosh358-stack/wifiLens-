import httpx

response = httpx.post("http://127.0.0.1:8000/api/v1/auth/register", json={
    "email": "test@test.com",
    "password": "password123",
    "name": "Test"
})

if response.status_code == 201:
    print("Registered successfully!")
    print(response.json())
elif response.status_code == 409:
    print("Already registered — that's fine, you can log in with these credentials.")
else:
    print(f"Unexpected response: {response.status_code}")
    print(response.text)