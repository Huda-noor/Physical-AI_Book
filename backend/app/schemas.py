"""
Pydantic schemas for request/response validation.
Based on specs/textbook-generation/contracts/openapi.yaml
"""
from pydantic import BaseModel, Field, field_validator
from typing import List
from datetime import datetime
from uuid import UUID


# ============================================================================
# Request Schemas
# ============================================================================

class ChatQueryRequest(BaseModel):
    """Request schema for /api/query endpoint."""

    question: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="User's question about textbook content"
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Number of relevant chunks to retrieve"
    )

    @field_validator("question")
    @classmethod
    def sanitize_question(cls, v: str) -> str:
        """Remove excessive whitespace and validate content."""
        cleaned = " ".join(v.split())
        if not cleaned:
            raise ValueError("Question cannot be empty or whitespace-only")
        return cleaned


# ============================================================================
# Response Schemas
# ============================================================================

class SourceCitation(BaseModel):
    """Single source citation with chapter/section metadata."""

    chunk_id: UUID
    chapter_id: int = Field(..., ge=1, le=6)
    section_id: str
    section_title: str
    preview_text: str = Field(..., max_length=200)
    relevance_score: float = Field(..., ge=0.0, le=1.0)


class ChatQueryResponse(BaseModel):
    """Response schema for /api/query endpoint."""

    answer: str = Field(..., description="Synthesized answer from retrieved chunks")
    sources: List[SourceCitation] = Field(
        ...,
        min_length=1,
        max_length=10,
        description="List of source citations"
    )
    query_time_ms: int = Field(..., ge=0, description="Query processing time in milliseconds")


class ErrorResponse(BaseModel):
    """Standard error response schema."""

    error: str = Field(..., description="Error type (e.g., 'validation_error', 'rate_limit')")
    message: str = Field(..., description="Human-readable error message")
    details: dict = Field(default_factory=dict, description="Additional error context")


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(..., description="Overall health status: 'healthy' or 'degraded'")
    qdrant: str = Field(..., description="Qdrant connection status")
    postgres: str = Field(..., description="PostgreSQL connection status")
    embedding_model: str = Field(..., description="Embedding model load status")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Internal Data Models (for indexing)
# ============================================================================

class ChunkMetadata(BaseModel):
    """Metadata for a single content chunk (stored in Neon)."""

    chunk_id: UUID
    chapter_id: int = Field(..., ge=1, le=6)
    section_id: str
    section_title: str
    chunk_index: int = Field(..., ge=0)
    token_count: int = Field(..., ge=100, le=512)
    char_count: int = Field(..., gt=0)
    preview_text: str
    indexed_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
