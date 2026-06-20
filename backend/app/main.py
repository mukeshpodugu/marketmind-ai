from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.session import engine, Base
from app.api import auth, stocks, predictions, portfolios, watchlists, sentiment, reports, admin
import logging

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("marketmind")

# Create tables in DB (or SQLite fallback) on startup
try:
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Stock Prediction and Market Analytics Platform API",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the specific frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(stocks.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(portfolios.router, prefix=settings.API_V1_STR)
app.include_router(watchlists.router, prefix=settings.API_V1_STR)
app.include_router(sentiment.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["System Status"])
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "api_version": "1.0.0",
        "developer": {
            "name": settings.DEV_NAME,
            "email": settings.DEV_EMAIL,
            "phone": settings.DEV_PHONE,
            "location": settings.DEV_LOCATION
        }
    }
