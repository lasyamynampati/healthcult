import logging
from pathlib import Path

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import get_db

# Configure basic logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up HealthCult API")
    yield

app = FastAPI(title="HealthCult API", version="0.1.0", debug=settings.debug, lifespan=lifespan)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Request error on {request.url.path}: {str(e)}")
        raise e

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
STATIC_DIR = PROJECT_ROOT / "backend" / "app" / "static"

# Mount static files if directory exists
try:
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
except Exception:
    pass  # Static directory may not exist in development

# Include the main API router
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/")
def root():
    return {"message": "HealthCult API", "version": "0.1.0", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        logger.error(f"DB readiness check failed: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Database connection failed")
