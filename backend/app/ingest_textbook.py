"""
Document ingestion pipeline for textbook chapters.
Processes markdown files, chunks content, generates embeddings,
and stores in Qdrant + Neon.
"""
import os
import re
import logging
from pathlib import Path
from typing import List, Dict, Tuple
from uuid import uuid4
from datetime import datetime
import markdown
from bs4 import BeautifulSoup

from app.config import settings
from app.services.openai_service import openai_service
from app.services.qdrant_service import qdrant_service
from app.services.neon_service import neon_service
from app.schemas import ChunkMetadata

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chunking parameters
CHUNK_SIZE = 800  # characters per chunk
CHUNK_OVERLAP = 200  # overlap between chunks


def parse_markdown_file(file_path: Path) -> Dict:
    """
    Parse a markdown file and extract structure.

    Args:
        file_path: Path to markdown file

    Returns:
        Dict with chapter info and sections
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract chapter number from filename
    filename = file_path.stem
    chapter_match = re.search(r'chapter-(\d+)', filename)
    chapter_id = int(chapter_match.group(1)) if chapter_match else 0

    # Convert markdown to HTML for parsing
    html = markdown.markdown(content)
    soup = BeautifulSoup(html, 'html.parser')

    # Extract title (first h1)
    title_tag = soup.find('h1')
    title = title_tag.get_text() if title_tag else filename

    # Extract sections (h2 and their content)
    sections = []
    current_section = None

    for tag in soup.find_all(['h2', 'h3', 'p', 'ul', 'ol', 'pre']):
        if tag.name == 'h2':
            if current_section:
                sections.append(current_section)
            current_section = {
                'title': tag.get_text(),
                'content': ''
            }
        elif current_section:
            current_section['content'] += tag.get_text() + '\n\n'

    if current_section:
        sections.append(current_section)

    return {
        'chapter_id': chapter_id,
        'title': title,
        'sections': sections
    }


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """
    Split text into overlapping chunks.

    Args:
        text: Input text
        chunk_size: Target chunk size in characters
        overlap: Overlap between chunks

    Returns:
        List of text chunks
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]

        # Try to break at sentence boundary
        if end < text_length:
            last_period = chunk.rfind('.')
            last_newline = chunk.rfind('\n')
            break_point = max(last_period, last_newline)

            if break_point > chunk_size * 0.5:  # At least 50% of chunk
                chunk = chunk[:break_point + 1]
                end = start + break_point + 1

        chunks.append(chunk.strip())
        start = end - overlap

    return chunks


def estimate_tokens(text: str) -> int:
    """Rough token estimation (1 token ≈ 4 characters)."""
    return len(text) // 4


def ingest_chapter(file_path: Path) -> bool:
    """
    Ingest a single chapter file.

    Args:
        file_path: Path to chapter markdown file

    Returns:
        True if ingestion succeeded
    """
    try:
        logger.info(f"Processing {file_path.name}...")

        # Parse chapter
        chapter_data = parse_markdown_file(file_path)
        chapter_id = chapter_data['chapter_id']
        logger.info(f"  Chapter {chapter_id}: {chapter_data['title']}")

        total_chunks = 0

        # Process each section
        for section_idx, section in enumerate(chapter_data['sections'], 1):
            section_title = section['title']
            section_content = section['content']

            # Skip empty sections
            if not section_content.strip():
                continue

            # Chunk the section content
            chunks = chunk_text(section_content)
            logger.info(f"  Section: {section_title} ({len(chunks)} chunks)")

            # Process each chunk
            chunk_data = []
            for chunk_idx, chunk_text in enumerate(chunks):
                # Generate unique ID
                chunk_id = uuid4()

                # Generate embedding
                embedding = openai_service.get_embedding(chunk_text)

                # Prepare metadata
                preview = chunk_text[:200] + '...' if len(chunk_text) > 200 else chunk_text
                token_count = estimate_tokens(chunk_text)

                # Prepare for Qdrant
                payload = {
                    'chapter_id': chapter_id,
                    'section_id': f"{chapter_id}.{section_idx}",
                    'section_title': section_title,
                    'chunk_index': chunk_idx,
                    'text': chunk_text,
                    'preview_text': preview
                }
                chunk_data.append((chunk_id, embedding, payload))

                # Store metadata in Neon
                metadata = ChunkMetadata(
                    chunk_id=chunk_id,
                    chapter_id=chapter_id,
                    section_id=f"{chapter_id}.{section_idx}",
                    section_title=section_title,
                    chunk_index=chunk_idx,
                    token_count=token_count,
                    char_count=len(chunk_text),
                    preview_text=preview,
                    full_text=chunk_text,
                    indexed_at=datetime.now()
                )
                neon_service.insert_chunk_metadata(metadata)

            # Batch insert into Qdrant
            if chunk_data:
                qdrant_service.upsert_chunks(chunk_data)
                total_chunks += len(chunk_data)

        logger.info(f"✅ Chapter {chapter_id} complete: {total_chunks} chunks indexed")
        return True

    except Exception as e:
        logger.error(f"Failed to ingest {file_path.name}: {e}")
        return False


def ingest_all_chapters(docs_dir: str = "../website/docs") -> None:
    """
    Ingest all chapter files from docs directory.

    Args:
        docs_dir: Path to docs directory with chapter markdown files
    """
    # Ensure collection exists
    qdrant_service.ensure_collection()

    # Find all chapter files
    docs_path = Path(docs_dir)
    chapter_files = sorted(docs_path.glob("chapter-*.md"))

    logger.info(f"Found {len(chapter_files)} chapter files")

    success_count = 0
    for chapter_file in chapter_files:
        if ingest_chapter(chapter_file):
            success_count += 1

    logger.info(f"\n{'='*60}")
    logger.info(f"Ingestion complete: {success_count}/{len(chapter_files)} chapters indexed")
    logger.info(f"{'='*60}")


if __name__ == "__main__":
    # Run ingestion
    ingest_all_chapters()
