-- Neon PostgreSQL schema for RAG chatbot
-- Physical AI & Humanoid Robotics Textbook

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chunk metadata table
CREATE TABLE IF NOT EXISTS chunk_metadata (
    chunk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id INTEGER NOT NULL,
    section_id VARCHAR(50) NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    chunk_index INTEGER NOT NULL,
    token_count INTEGER NOT NULL,
    char_count INTEGER NOT NULL,
    preview_text TEXT NOT NULL,
    full_text TEXT NOT NULL,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Composite unique constraint
    UNIQUE(chapter_id, section_id, chunk_index)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_chapter_id ON chunk_metadata(chapter_id);
CREATE INDEX IF NOT EXISTS idx_section_id ON chunk_metadata(section_id);
CREATE INDEX IF NOT EXISTS idx_indexed_at ON chunk_metadata(indexed_at DESC);

-- Optional: Chat history table (for future analytics)
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    selected_text TEXT,
    relevant_chunks UUID[],
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON chat_history(timestamp DESC);

-- Translation cache table
CREATE TABLE IF NOT EXISTS translated_chapters (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    chapter_id INTEGER NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    translated_content TEXT NOT NULL,
    generation_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, chapter_id, target_language)
);

-- View for chunk statistics by chapter
CREATE OR REPLACE VIEW chapter_statistics AS
SELECT
    chapter_id,
    COUNT(*) as total_chunks,
    SUM(token_count) as total_tokens,
    AVG(token_count)::INTEGER as avg_tokens_per_chunk,
    MIN(indexed_at) as first_indexed,
    MAX(indexed_at) as last_indexed
FROM chunk_metadata
GROUP BY chapter_id
ORDER BY chapter_id;
