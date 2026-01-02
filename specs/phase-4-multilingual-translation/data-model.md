# Data Model: Multilingual Content Translation

This document outlines the database schema and entity relationships for Phase 4.

## Entity Relationship Diagram

```text
  ┌──────────┐          ┌───────────────────────┐
  │   user   │ 1 ◄──── 1 │ translated_chapters   │
  └────┬─────┘          └───────────────────────┘
       │ 1
       │
       ▼ *
  ┌───────────────────────┐
  │ user_profiles         │
  └───────────────────────┘
```

## Tables

### 1. `user_profiles` (extends Phase 3)
Stores student background data used for both personalization and language preferences.

| Column | Type | Description |
| :--- | :--- | :--- |
| `user_id` | UUID (PK, FK) | References `user.id` (Better Auth table) |
| `software_experience` | JSONB | Levels for Python, ROS 2, etc. |
| `robotics_experience` | VARCHAR(50) | 'none', 'simulation_only', 'real_hardware' |
| `hardware_access` | JSONB | List of available hardware (GPU, Jetson, etc.) |
| `learning_goals` | JSONB | List of student goals |
| `profile_hash` | VARCHAR(64) | MD5 of background data (for personalization cache) |
| `preferred_language` | VARCHAR(10) | User's preferred display language: 'en', 'de', 'fr', 'ur' |
| `updated_at` | TIMESTAMP | Last profile modification |

**Validation Rules:**
- `preferred_language` must be one of: 'en', 'de', 'fr', 'ur', null
- `robotics_experience` must be one of: 'none', 'simulation_only', 'real_hardware'

### 2. `translated_chapters` (NEW)
Cache for translated chapter content per user and target language.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | SERIAL (PK) | Internal ID |
| `user_id` | UUID (FK) | References `user.id` |
| `chapter_id` | INTEGER | Chapter number (1-6) |
| `target_language` | VARCHAR(10) | Target language: 'ur', 'de', 'fr' |
| `translated_content` | TEXT | Translated markdown content |
| `chapter_version` | INTEGER | Version of source textbook chapter |
| `is_cached` | BOOLEAN | Whether this is a fresh translation (true) or cached (false) |
| `generation_time_ms` | INTEGER | Time taken to generate translation |
| `created_at` | TIMESTAMP | Generation timestamp |

**Unique Constraint**: `(user_id, chapter_id, target_language)`

**Indexes:**
- `idx_translations_lookup` on `(user_id, chapter_id, target_language)`
- `idx_translations_language` on `target_language`
- `idx_translations_created_at` on `created_at DESC`

## State Transitions

### Translation Flow
1. User selects target language (Urdu, German, French) from dropdown
2. User clicks "Translate" button
3. Frontend sends POST request to `/api/translate` with chapter_id + target_language
4. Backend checks cache table for existing translation
5. If cache hit: Return cached translation with `is_cached: true`
6. If cache miss:
   - Load original chapter markdown
   - Call OpenAI GPT-4o-mini for translation
   - Save to cache table with `is_cached: true`
   - Return translation with `is_cached: false`
7. Frontend displays translated content with indicator
8. User can click "Back to English" to revert (sends `target_language: 'en'`)

### Language Preference Flow
1. User translates Chapter 1 to German
2. Cache stores `(user_id, 1, 'de')` entry
3. User navigates to Chapter 2
4. Frontend retrieves `preferred_language: 'de'` from user profile
5. Frontend checks cache for Chapter 2 in German
6. If cached: Display instantly
7. If not cached: Prompt user to translate Chapter 2 (or auto-translate based on preference)

### Cache Invalidation
- **Profile Update**: When user updates `preferred_language` in profile, existing translations remain valid (no invalidation needed)
- **Chapter Update**: When textbook chapter content changes (increment `chapter_version`), all translations for that chapter become stale
  - Option 1: Delete all translations for affected `chapter_id`
  - Option 2: Add `chapter_version` column check, return "Chapter updated, please re-translate"
- **User Request**: Always provide option to force re-translate (ignores cache)

## Data Integrity Constraints

### Code Block Preservation
- Translation service MUST identify and preserve code blocks:
  - Triple backticks with language: ```python, ```bash, ```rust
  - Triple backticks without language: ```
  - Single backticks: `inline code`
- Code block content is passed through translation API as-is
- Translation prompt explicitly instructs: "Do NOT translate code within triple backticks"

### Technical Terminology Rules
- Preserve specific domain terms in original language:
  - "tensor" (keep, not translate to German "Tensor")
  - "gradient descent" (keep)
  - "neural network" (keep)
  - "ROS" (keep, not translate)
  - "kinematics" (keep)
  - "dynamics" (keep)

### Markdown Structure Preservation
- Preserve heading levels (# ## ### ####)
- Preserve list syntax (-, *, 1., 2.)
- Preserve table formatting (| separator)
- Preserve emphasis markers (**, __, *, ~)
- Preserve blockquotes (>)

## Performance Considerations

### Query Optimization
- `idx_translations_lookup`: Fast lookup by user + chapter + language
- `idx_translations_created_at`: Order by creation for cache cleanup
- JSONB columns enable complex queries without joins

### Cache Size Estimates
- Average translation: ~15,000 characters
- Translation + metadata: ~20KB per entry
- Expected entries: 100 users × 3 languages × 6 chapters = 1,800 entries max
- Total storage: 1,800 × 20KB = 36MB (well within Neon free tier 0.5GB)
- 50% cache hit rate: 900 entries actual usage

## Migration Notes

### Add to Existing Phase 3 Migration
```sql
-- Add preferred_language column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'
CHECK (preferred_language IN ('en', 'de', 'fr', 'ur', NULL));

-- Add index for lookups
CREATE INDEX idx_user_profiles_language ON user_profiles(user_id);
```

### Create Translation Cache Table
```sql
-- Already defined in spec.md, repeated here for clarity
CREATE TABLE translated_chapters (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    chapter_id INTEGER NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    translated_content TEXT NOT NULL,
    chapter_version INTEGER DEFAULT 1,
    is_cached BOOLEAN DEFAULT TRUE,
    generation_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, chapter_id, target_language),
    CONSTRAINT fk_translated_chapters_user_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_translations_lookup
ON translated_chapters(user_id, chapter_id, target_language);
CREATE INDEX idx_translations_language
ON translated_chapters(target_language);
CREATE INDEX idx_translations_created_at
ON translated_chapters(created_at DESC);
```

---

**Data Model Version**: 1.0 | **Last Updated**: 2026-01-03
