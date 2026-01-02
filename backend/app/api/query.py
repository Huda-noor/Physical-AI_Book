"""
Query API endpoint for RAG chatbot.
Handles POST /api/query requests with rate limiting.
"""
import logging
from fastapi import APIRouter, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas import ChatQueryRequest, ChatQueryResponse, ErrorResponse
from app.services.rag_service import rag_service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


from typing import Dict, Optional, Any
from app.services.auth_service import get_current_user
from app.services.neon_service import neon_service

@router.post(
    "/api/query",
    response_model=ChatQueryResponse,
    responses={
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    tags=["Query"]
)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def query_textbook(
    request: Request,
    query: ChatQueryRequest,
    current_user: Optional[Dict] = Depends(get_current_user)
):
    """
    Query the textbook using RAG with personalization.
    """
    try:
        logger.info(f"Received query: {query.question[:50]}...")

        # 1. Retrieve User Profile if logged in
        user_profile = None
        if current_user:
            user_id = current_user.get("id")
            profile_query = "SELECT * FROM user_profiles WHERE user_id = $1"
            user_profile = await neon_service.fetch_one(profile_query, user_id)

        # 2. Process query through RAG pipeline
        answer, sources, query_time_ms = rag_service.process_query(
            question=query.question,
            top_k=query.top_k,
            selected_text=query.selected_text,
            user_profile=user_profile
        )

        # Return response
        return ChatQueryResponse(
            answer=answer,
            sources=sources,
            query_time_ms=query_time_ms
        )

    except Exception as e:
        logger.error(f"Query processing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "query_processing_error",
                "message": "Failed to process your query. Please try again.",
                "details": {}
            }
        )
