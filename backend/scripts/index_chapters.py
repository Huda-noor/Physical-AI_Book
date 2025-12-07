"""
Index all textbook chapters into Qdrant and Neon.
Reads markdown files, chunks them, generates embeddings, and stores in databases.
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.utils.chunking import semantic_chunking, generate_preview_text
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service
from app.services.neon_service import neon_service
from app.schemas import ChunkMetadata
from dotenv import load_dotenv

load_dotenv()

# Path to chapter markdown files
DOCS_DIR = Path(__file__).parent.parent.parent / "website" / "docs"

CHAPTER_FILES = [
    "chapter-1-introduction-to-physical-ai.md",
    "chapter-2-basics-of-humanoid-robotics.md",
    "chapter-3-ros-2-fundamentals.md",
    "chapter-4-digital-twin-simulation.md",
    "chapter-5-vision-language-action-systems.md",
    "chapter-6-capstone-ai-robot-pipeline.md",
]


def index_chapter(chapter_file: str) -> int:
    """
    Index a single chapter file.

    Args:
        chapter_file: Filename of the markdown chapter

    Returns:
        Number of chunks indexed
    """
    filepath = DOCS_DIR / chapter_file
    print(f"\n📖 Processing: {chapter_file}")

    if not filepath.exists():
        print(f"   ❌ File not found: {filepath}")
        return 0

    # Read markdown content
    with open(filepath, 'r', encoding='utf-8') as f:
        markdown_content = f.read()

    # Chunk the content
    print(f"   ✂️  Chunking content...")
    chunks = semantic_chunking(markdown_content, max_tokens=512, overlap_tokens=50)
    print(f"   📊 Created {len(chunks)} chunks")

    # Generate embeddings
    print(f"   🧠 Generating embeddings...")
    chunk_texts = [chunk['content'] for chunk in chunks]
    embeddings = embedding_service.encode_batch(chunk_texts)
    print(f"   ✅ Generated {len(embeddings)} embeddings")

    # Prepare data for Qdrant and Neon
    qdrant_points = []
    neon_metadata = []

    for chunk, embedding in zip(chunks, embeddings):
        # Qdrant payload (minimal, vector search only)
        payload = {
            'chapter_id': chunk['chapter_id'],
            'section_id': chunk['section_id'],
            'chunk_index': chunk['chunk_index']
        }

        qdrant_points.append((
            chunk['chunk_id'],
            embedding,
            payload
        ))

        # Neon metadata (full details for retrieval)
        preview = generate_preview_text(chunk['content'], max_length=200)

        metadata = ChunkMetadata(
            chunk_id=chunk['chunk_id'],
            chapter_id=chunk['chapter_id'],
            section_id=chunk['section_id'],
            section_title=chunk['section_title'],
            chunk_index=chunk['chunk_index'],
            token_count=chunk['token_count'],
            char_count=chunk['char_count'],
            preview_text=preview
        )

        neon_metadata.append(metadata)

    # Insert into Qdrant
    print(f"   💾 Inserting into Qdrant...")
    qdrant_success = qdrant_service.upsert_chunks(qdrant_points)

    if not qdrant_success:
        print(f"   ❌ Failed to insert into Qdrant")
        return 0

    # Insert into Neon
    print(f"   💾 Inserting into Neon...")
    neon_success_count = 0

    for metadata in neon_metadata:
        success = neon_service.insert_chunk_metadata(metadata)
        if success:
            neon_success_count += 1

    print(f"   ✅ Indexed {neon_success_count}/{len(chunks)} chunks")

    return neon_success_count


def main():
    """Index all chapters."""
    print("=" * 60)
    print("📚 Physical AI Textbook Indexing")
    print("=" * 60)

    # Load embedding model
    print("\n🔧 Loading embedding model...")
    model_loaded = embedding_service.load_model()

    if not model_loaded:
        print("❌ Failed to load embedding model")
        print("Run: python scripts/download_model.py")
        sys.exit(1)

    print("✅ Embedding model loaded")

    # Ensure Qdrant collection exists
    print("\n🔧 Ensuring Qdrant collection exists...")
    collection_ready = qdrant_service.ensure_collection()

    if not collection_ready:
        print("❌ Failed to create Qdrant collection")
        print("Check QDRANT_URL and QDRANT_API_KEY in .env")
        sys.exit(1)

    print("✅ Qdrant collection ready")

    # Index all chapters
    total_chunks = 0

    for chapter_file in CHAPTER_FILES:
        chunks_indexed = index_chapter(chapter_file)
        total_chunks += chunks_indexed

    # Summary
    print("\n" + "=" * 60)
    print(f"✨ Indexing Complete!")
    print(f"   Total chapters: {len(CHAPTER_FILES)}")
    print(f"   Total chunks: {total_chunks}")
    print(f"   Avg chunks/chapter: {total_chunks / len(CHAPTER_FILES):.1f}")
    print("=" * 60)

    print("\n📌 Next steps:")
    print("  1. Test query: python -c \"from app.services.qdrant_service import qdrant_service; print(qdrant_service.health_check())\"")
    print("  2. Start backend: uvicorn app.main:app --reload")
    print("  3. Test endpoint: curl http://localhost:8000/health")


if __name__ == "__main__":
    main()
