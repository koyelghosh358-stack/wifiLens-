from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.models import models
from app.routers import auth, devices, scans, networks, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WiFiLens API",
    description="Backend for the WiFiLens Wi-Fi signal analyzer.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "service": "WiFiLens API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}


app.include_router(auth.router)
app.include_router(devices.router)
app.include_router(scans.router)
app.include_router(networks.router)
app.include_router(analytics.router)