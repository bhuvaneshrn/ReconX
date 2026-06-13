from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routes import recon, history, export, auth_routes
from app.database import init_db

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="ReconX API",
    description="Automated OSINT & Recon Dashboard - Passive Recon Only",
    version="3.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://recon-x-zeta.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/v1", tags=["auth"])
app.include_router(recon.router, prefix="/api/v1", tags=["recon"])
app.include_router(history.router, prefix="/api/v1", tags=["history"])
app.include_router(export.router, prefix="/api/v1", tags=["export"])


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/")
async def root():
    return {"status": "ok", "message": "ReconX API v3.0 — Passive Recon Only"}


@app.get("/health")
async def health():
    return {"status": "healthy"}