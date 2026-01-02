-- Phase 3 Database Migration: Authentication & Personalization Tables
-- Physical AI & Humanoid Robotics Textbook

-- This script extends the Phase 2 schema with user authentication and personalization tables

-- ==================================================================
-- Better Auth Tables (simplified for custom implementation)
-- Note: Better Auth typically manages its own schema.
-- These tables provide the core structure needed for user management.
-- ==================================================================

-- If using Better Auth Node.js sidecar, it will create its own tables.
-- The tables below are for custom profile storage that extends Better Auth users.

-- ==================================================================
-- User Profiles Table
-- ==================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY,

    -- Software Experience (JSONB for flexibility)
    software_experience JSONB DEFAULT '{}',
    -- Example: {"python": "advanced", "javascript": "intermediate", "ros2": "basic", "cpp": "none", "typescript": "none"}

    -- Robotics Experience
    robotics_experience VARCHAR(50) DEFAULT 'none',
    -- Values: 'none', 'simulation_only', 'real_hardware'

    -- Hardware Access (JSONB array)
    hardware_access JSONB DEFAULT '[]',
    -- Example: ["gpu_nvidia", "jetson_nano", "lidar", "sensors"]

    -- Learning Goals (JSONB array)
    learning_goals JSONB DEFAULT '[]',
    -- Example: ["career_change", "academic_research", "hobby", "professional_development"]

    -- Profile Hash for Cache Keying
    profile_hash VARCHAR(64) NOT NULL,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: user_id should ideally reference a users table
    -- but we keep it standalone for flexibility with external auth providers
    CONSTRAINT valid_robotics_experience CHECK (
        robotics_experience IN ('none', 'simulation_only', 'real_hardware')
    )
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_hash ON user_profiles(profile_hash);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at DESC);

-- ==================================================================
-- Personalized Chapters Table (Cache Metadata)
-- ==================================================================
CREATE TABLE IF NOT EXISTS personalized_chapters (
    id SERIAL PRIMARY KEY,

    user_id UUID NOT NULL,
    chapter_id INTEGER NOT NULL,

    -- The profile state used for this generation
    profile_hash VARCHAR(64) NOT NULL,

    -- Storage path in S3/object storage
    storage_path VARCHAR(255) NOT NULL,

    -- Version of the source textbook chapter (for cache invalidation on updates)
    chapter_version INTEGER DEFAULT 1,

    -- Performance metrics
    generation_time_ms INTEGER,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint prevents duplicate personalizations for same profile
    UNIQUE(user_id, chapter_id, profile_hash)
);

-- Create indexes for efficient cache lookups
CREATE INDEX IF NOT EXISTS idx_personalized_chapters_user_chapter ON personalized_chapters(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_personalized_chapters_hash ON personalized_chapters(profile_hash);
CREATE INDEX IF NOT EXISTS idx_personalized_chapters_created_at ON personalized_chapters(created_at DESC);

-- Foreign key constraint (optional - comment out if user_profiles is managed externally)
ALTER TABLE personalized_chapters
ADD CONSTRAINT fk_personalized_chapters_user_id
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
ON DELETE CASCADE;

-- ==================================================================
-- Better Auth Users Table (Placeholder)
-- ==================================================================
-- If Better Auth creates its own users table, this table can be used as a reference
-- or removed. It's included here for documentation purposes.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link user_profiles to the users table
ALTER TABLE user_profiles
ADD CONSTRAINT fk_user_profiles_user_id
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- ==================================================================
-- Sessions Table (for Better Auth)
-- ==================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ==================================================================
-- Views and Helper Functions
-- ==================================================================

-- View for personalized chapter statistics per user
CREATE OR REPLACE VIEW user_personalization_stats AS
SELECT
    up.user_id,
    COUNT(pc.id) as total_personalizations,
    COUNT(DISTINCT pc.chapter_id) as unique_chapters,
    AVG(pc.generation_time_ms)::INTEGER as avg_generation_time_ms,
    MAX(pc.created_at) as last_personalized_at
FROM user_profiles up
LEFT JOIN personalized_chapters pc ON up.user_id = pc.user_id
GROUP BY up.user_id;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================================================================
-- Data Validation Functions
-- ==================================================================

-- Function to validate software experience structure
CREATE OR REPLACE FUNCTION validate_software_experience(exp JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check that it has at least one skill
    IF jsonb_object_keys(exp) IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check that all values are valid levels
    IF NOT EXISTS (
        SELECT 1 FROM jsonb_object_keys(exp) AS key
        WHERE exp->>key IN ('none', 'beginner', 'intermediate', 'advanced')
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ==================================================================
-- Sample Data (for testing - remove in production)
-- ==================================================================

-- Uncomment to insert sample data for testing
/*
INSERT INTO users (id, email, email_verified, name) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'test@example.com', TRUE, 'Test User')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (user_id, software_experience, robotics_experience, hardware_access, learning_goals, profile_hash)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '{"python": "intermediate", "javascript": "beginner", "ros2": "none", "cpp": "none", "typescript": "beginner"}'::jsonb,
    'simulation_only',
    '["gpu_nvidia"]'::jsonb,
    '["career_change", "academic_research"]'::jsonb,
    'test-profile-hash-123'
)
ON CONFLICT (user_id) DO NOTHING;
*/
