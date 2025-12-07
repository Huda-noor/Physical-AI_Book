"""
Database models and utility functions.
Since we're using psycopg2 directly (not an ORM), this file provides
helper functions for common database operations.
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from app.schemas import ChunkMetadata


def chunk_metadata_from_row(row: dict) -> ChunkMetadata:
    """
    Convert database row dict to ChunkMetadata Pydantic model.

    Args:
        row: Dictionary from psycopg2 RealDictCursor

    Returns:
        ChunkMetadata instance
    """
    return ChunkMetadata(
        chunk_id=row["chunk_id"],
        chapter_id=row["chapter_id"],
        section_id=row["section_id"],
        section_title=row["section_title"],
        chunk_index=row["chunk_index"],
        token_count=row["token_count"],
        char_count=row["char_count"],
        preview_text=row["preview_text"],
        indexed_at=row.get("indexed_at", datetime.utcnow())
    )


def validate_chapter_id(chapter_id: int) -> bool:
    """
    Validate chapter ID is within range (1-6).

    Args:
        chapter_id: Chapter number

    Returns:
        True if valid
    """
    return 1 <= chapter_id <= 6


def generate_preview_text(content: str, max_chars: int = 200) -> str:
    """
    Generate preview text from chunk content.

    Args:
        content: Full chunk text
        max_chars: Maximum characters in preview

    Returns:
        Truncated preview with ellipsis
    """
    if len(content) <= max_chars:
        return content

    # Truncate at word boundary
    truncated = content[:max_chars]
    last_space = truncated.rfind(" ")

    if last_space > max_chars * 0.8:  # Only if we're close to the limit
        truncated = truncated[:last_space]

    return truncated.strip() + "..."
