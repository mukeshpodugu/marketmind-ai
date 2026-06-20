import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("marketmind")
logging.basicConfig(level=logging.INFO)

Base = declarative_base()

engine = None
SessionLocal = None

def init_db_engine():
    global engine, SessionLocal
    # Try PostgreSQL first
    db_url = settings.DATABASE_URL
    try:
        logger.info(f"Attempting connection to PostgreSQL: {db_url.split('@')[-1]}")
        # Add connect timeout to fail fast if DB is down
        engine = create_engine(
            db_url, 
            pool_pre_ping=True,
            connect_args={"connect_timeout": 5} if "postgresql" in db_url else {}
        )
        # Test connection
        with engine.connect() as conn:
            logger.info("Successfully connected to PostgreSQL database.")
    except Exception as e:
        logger.error(f"PostgreSQL connection failed: {e}. Falling back to SQLite.")
        fallback_url = settings.SQLITE_FALLBACK_URL
        engine = create_engine(
            fallback_url, 
            connect_args={"check_same_thread": False} if "sqlite" in fallback_url else {}
        )
        logger.info(f"Successfully initialized SQLite database at: {fallback_url}")
        
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize on startup
init_db_engine()

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
