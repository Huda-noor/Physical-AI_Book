from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
import time
import logging

from app.services.auth_service import get_current_user
from app.services.neon_service import neon_service
from app.services.translation_service import translation_service
from app.api.personalize import get_chapter_path

logger = logging.getLogger(__name__)
router = APIRouter()

class TranslateRequest(BaseModel):
    chapter_id: int = Field(..., ge=1, le=6)
    target_lang: str = Field(..., pattern="^(ur|de|fr|en)$")

class TranslateResponse(BaseModel):
    chapter_id: int
    translated_markdown: str
    target_lang: str
    is_cached: bool
    generation_time_ms: int

@router.post("/translate", response_model=TranslateResponse)
async def translate_chapter(
    request: TranslateRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")
    start_time = time.time()

    if request.target_lang == "en":
        # Handle original content request
        path = get_chapter_path(request.chapter_id)
        with open(path, "r", encoding="utf-8") as f:
            return TranslateResponse(
                chapter_id=request.chapter_id,
                translated_markdown=f.read(),
                target_lang="en",
                is_cached=True,
                generation_time_ms=0
            )

    # 1. Check Cache
    cache_query = """
    SELECT translated_content FROM translated_chapters
    WHERE user_id = $1 AND chapter_id = $2 AND target_language = $3
    """
    cached = await neon_service.fetch_one(cache_query, user_id, request.chapter_id, request.target_lang)

    if cached:
        return TranslateResponse(
            chapter_id=request.chapter_id,
            translated_markdown=cached["translated_content"],
            target_lang=request.target_lang,
            is_cached=True,
            generation_time_ms=int((time.time() - start_time) * 1000)
        )

    # 2. Translate
    path = get_chapter_path(request.chapter_id)
    with open(path, "r", encoding="utf-8") as f:
        original_text = f.read()

    translated = await translation_service.translate_markdown(original_text, request.target_lang)
    gen_time = int((time.time() - start_time) * 1000)

    # 3. Save Cache
    save_query = """
    INSERT INTO translated_chapters (user_id, chapter_id, target_language, translated_content, generation_time_ms)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, chapter_id, target_language) DO UPDATE
    SET translated_content = EXCLUDED.translated_content, generation_time_ms = EXCLUDED.generation_time_ms
    """
    await neon_service.execute(save_query, user_id, request.chapter_id, request.target_lang, translated, gen_time)

    return TranslateResponse(
        chapter_id=request.chapter_id,
        translated_markdown=translated,
        target_lang=request.target_lang,
        is_cached=False,
        generation_time_ms=gen_time
    )
