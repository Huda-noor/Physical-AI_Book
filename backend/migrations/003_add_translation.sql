-- Phase 4 Database Migration: Translation Cache Table
-- Physical AI & Humanoid Robotics Textbook

-- This script extends the Phase 3 schema with translation caching tables

-- ==================================================================
-- Add preferred_language to user_profiles table
-- ==================================================================
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Add constraint for valid language values
ALTER TABLE user_profiles
ADD CONSTRAINT valid_preferred_language CHECK (
    preferred_language IN ('en', 'de', 'fr', 'ur', NULL)
);

-- Create index for language preference lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_language
ON user_profiles(user_id);

-- ==================================================================
-- Translations Table (Cache)
-- ==================================================================
CREATE TABLE IF NOT EXISTS translated_chapters (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    chapter_id INTEGER NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    translated_content TEXT NOT NULL,
    chapter_version INTEGER DEFAULT 1,
    is_cached BOOLEAN DEFAULT TRUE,
    generation_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint prevents duplicate translations for same user/chapter/language
    UNIQUE(user_id, chapter_id, target_language)
);

-- Foreign key to users table
ALTER TABLE translated_chapters
ADD CONSTRAINT fk_translated_chapters_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for efficient cache lookups
CREATE INDEX IF NOT EXISTS idx_translations_lookup
ON translated_chapters(user_id, chapter_id, target_language);

CREATE INDEX IF NOT EXISTS idx_translations_language
ON translated_chapters(target_language);

CREATE INDEX IF NOT EXISTS idx_translations_created_at
ON translated_chapters(created_at DESC);

-- ==================================================================
-- Update Trigger for updated_at in user_profiles
-- ==================================================================
-- Trigger already exists from Phase 3 migration

-- ==================================================================
-- View for translation statistics per user
-- ==================================================================
CREATE OR REPLACE VIEW user_translation_stats AS
SELECT
    up.user_id,
    COUNT(tc.id) as total_translations,
    COUNT(DISTINCT tc.chapter_id) as unique_chapters,
    COUNT(DISTINCT tc.target_language) as languages_used,
    AVG(tc.generation_time_ms)::INTEGER as avg_generation_time_ms,
    MAX(tc.created_at) as last_translation_at
FROM user_profiles up
LEFT JOIN translated_chapters tc ON up.user_id = tc.user_id
GROUP BY up.user_id;

-- ==================================================================
-- Sample Data (for testing - remove in production)
-- ==================================================================

-- Uncomment to insert sample data for testing
/*
-- Update a user profile with German preference
UPDATE user_profiles
SET preferred_language = 'de'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

-- Insert sample translation (this would be actual translated content)
INSERT INTO translated_chapters (
    user_id, chapter_id, target_language, translated_content,
    chapter_version, is_cached, generation_time_ms
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    'de',
    '# Chapter 1: Introduction to Physical AI (German translation)...',
    1,
    TRUE,
    5000
)
ON CONFLICT (user_id, chapter_id, target_language) DO NOTHING;
*/
