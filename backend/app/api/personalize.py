from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import logging
import os
import time

from app.services.auth_service import get_current_user
from app.services.neon_service import neon_service
from app.services.personalization_service import personalization_service
from app.services.s3_service import s3_service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

class PersonalizeRequest(BaseModel):
    chapter_id: int = Field(..., ge=1, le=6, description="The chapter number to personalize")

class PersonalizeResponse(BaseModel):
    chapter_id: int
    personalized_markdown: str
    is_cached: bool
    generation_time_ms: int

def get_chapter_path(chapter_id: int) -> str:
    """Returns the absolute path to the original chapter markdown."""
    base_path = os.path.join(os.getcwd(), "website", "docs")
    # Search for files starting with "chapter-{chapter_id}-"
    target_prefix = f"chapter-{chapter_id}-"
    for filename in os.listdir(base_path):
        if filename.startswith(target_prefix) and filename.endswith(".md"):
            return os.path.join(base_path, filename)

    # Fallback to simple name if not found
    filename = f"chapter{chapter_id}.md"
    return os.path.join(base_path, filename)

@router.post("/personalize", response_model=PersonalizeResponse)
async def personalize_chapter(
    request: PersonalizeRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Personalizes a textbook chapter for the logged-in student.
    Uses caching (Neon + S3) to minimize LLM costs.
    """
    user_id = current_user.get("id")
    chapter_id = request.chapter_id
    start_time = time.time()

    # 1. Retrieve User Profile
    profile_query = "SELECT * FROM user_profiles WHERE user_id = $1"
    profile = await neon_service.fetch_one(profile_query, user_id)

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Student profile not found. Please complete signup background."
        )

    profile_hash = profile["profile_hash"]

    # 2. Check Cache (Neon)
    cache_query = """
    SELECT storage_path FROM personalized_chapters
    WHERE user_id = $1 AND chapter_id = $2 AND profile_hash = $3
    """
    cached_record = await neon_service.fetch_one(cache_query, user_id, chapter_id, profile_hash)

    if cached_record:
        # 3. Cache Hit: Fetch from S3
        storage_path = cached_record["storage_path"]
        personalized_content = s3_service.download_content(storage_path)

        if personalized_content:
            generation_time_ms = int((time.time() - start_time) * 1000)
            return PersonalizeResponse(
                chapter_id=chapter_id,
                personalized_markdown=personalized_content,
                is_cached=True,
                generation_time_ms=generation_time_ms
            )
        else:
            logger.warning(f"Cache miss in S3 for path: {storage_path}. Regenerating.")

    # 4. Cache Miss: Generate with AI
    # Load original markdown
    original_path = get_chapter_path(chapter_id)
    if not os.path.exists(original_path):
        raise HTTPException(status_code=404, detail=f"Original chapter {chapter_id} not found.")

    with open(original_path, "r", encoding="utf-8") as f:
        original_content = f.read()

    # Call Personalization Service (OpenAI)
    personalized_content = await personalization_service.personalize_chapter(
        original_content,
        profile
    )

    # 5. Save to S3
    s3_key = f"personalized/{user_id}/{chapter_id}/{profile_hash}.md"
    upload_success = s3_service.upload_content(s3_key, personalized_content)

    # 6. Update Cache Metadata (Neon)
    generation_time_ms = int((time.time() - start_time) * 1000)

    if upload_success:
        upsert_query = """
        INSERT INTO personalized_chapters (
            user_id, chapter_id, profile_hash, storage_path, generation_time_ms
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, chapter_id, profile_hash)
        DO UPDATE SET
            storage_path = EXCLUDED.storage_path,
            generation_time_ms = EXCLUDED.generation_time_ms,
            created_at = CURRENT_TIMESTAMP;
        """
        await neon_service.execute(
            upsert_query,
            user_id,
            chapter_id,
            profile_hash,
            s3_key,
            generation_time_ms
        )

    return PersonalizeResponse(
        chapter_id=chapter_id,
        personalized_markdown=personalized_content,
        is_cached=False,
        generation_time_ms=generation_time_ms
    )
