"""
Health check endpoint for monitoring service dependencies.
"""
import logging
from fastapi import APIRouter

from app.schemas import HealthResponse
from app.services.qdrant_service import qdrant_service
from app.services.neon_service import neon_service
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.

    Verifies connectivity to:
    - Qdrant (vector database)
    - Neon PostgreSQL (metadata storage)
    - Embedding model (loaded in memory)

    Returns:
        HealthResponse with status of each service
    """
    # Check Qdrant
    qdrant_healthy = qdrant_service.health_check()
    qdrant_status = "connected" if qdrant_healthy else "disconnected"

    # Check Neon PostgreSQL
    neon_healthy = neon_service.health_check()
    neon_status = "connected" if neon_healthy else "disconnected"

    # Check Embedding Model
    embedding_healthy = embedding_service.health_check()
    embedding_status = "loaded" if embedding_healthy else "not_loaded"

    # Overall status
    all_healthy = qdrant_healthy and neon_healthy and embedding_healthy
    overall_status = "healthy" if all_healthy else "degraded"

    if not all_healthy:
        logger.warning(
            f"Health check degraded: "
            f"Qdrant={qdrant_status}, Neon={neon_status}, Embedding={embedding_status}"
        )

    return HealthResponse(
        status=overall_status,
        qdrant=qdrant_status,
        postgres=neon_status,
        embedding_model=embedding_status
    )
