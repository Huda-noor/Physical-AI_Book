"""
FastAPI application entry point for Physical AI textbook RAG system.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.api.health import router as health_router
from app.api.query import router as query_router
from app.api.profile import router as profile_router
from app.api.personalize import router as personalize_router
from app.api.translate import router as translate_router
from app.services.openai_service import openai_service
from app.services.qdrant_service import qdrant_service
from app.services.neon_service import neon_service

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown lifecycle manager.

    Loads embedding model on startup.
    """
    # Startup
    logger.info("🚀 Starting Physical AI Textbook API...")
    logger.info(f"Environment: {settings.log_level}")
    logger.info(f"CORS Origins: {settings.cors_origins}")

    # Verify OpenAI connection
    logger.info("Verifying OpenAI connection...")
    success = openai_service.health_check()
    if success:
        logger.info("✅ OpenAI API connected")
    else:
        logger.warning("⚠️ OpenAI API connection issue")

    # Verify Qdrant connection
    logger.info("Verifying Qdrant connection...")
    if qdrant_service.health_check():
        logger.info("✅ Qdrant connected")
    else:
        logger.warning("⚠️ Qdrant connection issue")

    # Verify Neon connection
    logger.info("Verifying Neon database connection...")
    if neon_service.health_check():
        logger.info("✅ Neon database connected")
    else:
        logger.warning("⚠️ Neon database connection issue")

    yield

    # Shutdown
    logger.info("Shutting down API...")


# Create FastAPI application
app = FastAPI(
    title="Physical AI & Humanoid Robotics Textbook API",
    description="RAG-powered chatbot API for querying textbook content",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health_router, prefix="", tags=["Health"])
app.include_router(query_router, prefix="", tags=["Query"])
app.include_router(profile_router, prefix="/api", tags=["Profile"])
app.include_router(personalize_router, prefix="/api", tags=["Personalization"])
app.include_router(translate_router, prefix="/api", tags=["Translation"])

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Physical AI Textbook API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.log_level.lower()
    )
