# WiFiLens

A full-stack Wi-Fi signal analyzer. Scans nearby wireless networks on Windows, stores results in a database, and visualizes signal strength, security, and history through a web dashboard.

## Project Structure

- `backend/` — FastAPI backend (auth, scan storage, analytics API)
- `frontend/` — Next.js dashboard (Dashboard, Scanner, Analytics, History, Settings)
- `scanner-agent/` — Local Windows scanning tool

## Important: Scanning is Windows-only

Browsers block websites from directly accessing Wi-Fi hardware data, for security reasons — this is true on every OS, not just Windows. To get around this, WiFiLens uses a small local program (`scanner-agent/agent_server.py`) that runs on your own Windows computer and talks to the website over `localhost`.

This means:
- The website itself (viewing dashboards, analytics, history) works on any device, anywhere.
- The **"Run Scan Now"** button only works if `agent_server.py` is running on a Windows machine, and the browser making the request is on that same machine.
- Mac and Linux scanning are not currently supported (would require separate OS-specific scanner programs).

## Running Locally

### 1. Backend
```bash
cd backend
venv\Scripts\Activate.ps1
python -m uvicorn app.main:app
```

### 2. Frontend
```bash
cd frontend
npm run dev
```

### 3. Scanner Agent (Windows only, for live scanning)
```bash
cd scanner-agent
python agent_server.py
```

Then visit `http://localhost:3000`, register an account, and click "Run Scan Now" on the Scanner page.

## Tech Stack

- **Backend:** FastAPI, SQLite (local dev), JWT auth
- **Frontend:** Next.js, TypeScript, Tailwind CSS, Recharts, Framer Motion
- **Scanner:** Python, `netsh` (Windows Wi-Fi CLI)
