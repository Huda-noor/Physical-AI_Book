"""
Database initialization script for chunk metadata storage.
Creates the chunk_metadata table in Neon PostgreSQL.
"""
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in .env file")
    print("Please set up Neon PostgreSQL and update backend/.env")
    sys.exit(1)

# SQL schema based on specs/textbook-generation/data-model.md
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS chunk_metadata (
    chunk_id UUID PRIMARY KEY,
    chapter_id INTEGER NOT NULL CHECK (chapter_id BETWEEN 1 AND 6),
    section_id VARCHAR(20) NOT NULL,
    section_title VARCHAR(200) NOT NULL,
    chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
    token_count INTEGER NOT NULL CHECK (token_count BETWEEN 100 AND 512),
    char_count INTEGER NOT NULL CHECK (char_count > 0),
    preview_text TEXT NOT NULL,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Composite unique constraint: one chunk per (chapter, section, index)
    CONSTRAINT unique_chunk UNIQUE (chapter_id, section_id, chunk_index)
);

-- Index for fast chapter-based queries
CREATE INDEX IF NOT EXISTS idx_chapter ON chunk_metadata(chapter_id);

-- Index for timestamp-based queries (for recency scoring)
CREATE INDEX IF NOT EXISTS idx_indexed_at ON chunk_metadata(indexed_at DESC);
"""

def main():
    """Initialize database with chunk_metadata table."""
    print("🔧 Initializing Neon PostgreSQL database...")
    print(f"📍 Database URL: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'Invalid URL'}")

    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Execute schema creation
        print("\n📝 Creating chunk_metadata table...")
        cursor.execute(CREATE_TABLE_SQL)

        # Verify table creation
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'chunk_metadata'
            ORDER BY ordinal_position;
        """)

        columns = cursor.fetchall()
        if columns:
            print("\n✅ Table created successfully!")
            print("\n📊 Schema:")
            for col_name, col_type, nullable in columns:
                null_str = "NULL" if nullable == "YES" else "NOT NULL"
                print(f"  - {col_name:20} {col_type:20} {null_str}")
        else:
            print("\n⚠️  Warning: Table may not have been created")

        # Check indexes
        cursor.execute("""
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'chunk_metadata';
        """)

        indexes = cursor.fetchall()
        if indexes:
            print("\n🔍 Indexes:")
            for idx_name, idx_def in indexes:
                print(f"  - {idx_name}")

        cursor.close()
        conn.close()

        print("\n✨ Database initialization complete!")
        print("\n📌 Next steps:")
        print("  1. Run: cd backend && uvicorn app.main:app --reload")
        print("  2. Visit: http://localhost:8000/health")
        print("  3. Index chapters: python scripts/index_chapters.py")

    except psycopg2.OperationalError as e:
        print(f"\n❌ Database connection failed: {e}")
        print("\n💡 Troubleshooting:")
        print("  1. Check DATABASE_URL in backend/.env")
        print("  2. Verify Neon project is active (not paused)")
        print("  3. Check network connectivity")
        sys.exit(1)

    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
