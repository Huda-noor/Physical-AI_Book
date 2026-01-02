# Data Model: Authentication & Personalization

This document outlines the database schema and entity relationships for Phase 3.

## Entity Relationship Diagram

```text
  ┌──────────┐          ┌──────────────┐
  │   user   │ 1 ◄──── 1 │ user_profiles│
  └────┬─────┘          └──────────────┘
       │ 1
       │
       ▼ *
  ┌───────────────────────┐
  │ personalized_chapters │
  └───────────────────────┘
```

## Tables

### 1. `user_profiles`
Stores student background data used for content personalization.

| Column | Type | Description |
| :--- | :--- | :--- |
| `user_id` | UUID (PK, FK) | References `user.id` (Better Auth table) |
| `software_experience` | JSONB | Levels for Python, ROS 2, C++, etc. |
| `robotics_experience` | VARCHAR(50) | 'none', 'simulation_only', 'real_hardware' |
| `hardware_access` | JSONB | List of available hardware (GPU, Jetson, etc.) |
| `learning_goals` | JSONB | List of student goals |
| `profile_hash` | VARCHAR(64) | MD5 of background data (for cache keying) |
| `updated_at` | TIMESTAMP | Last profile modification |

**Validation Rules**:
- `software_experience` must contain at least one skill level.
- `robotics_experience` must be one of the three allowed enum values.

### 2. `personalized_chapters` (Cache Metadata)
Metadata for personalized content stored in object storage.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | SERIAL (PK) | Internal ID |
| `user_id` | UUID (FK) | References `user.id` |
| `chapter_id` | INTEGER | Chapter number (1-6) |
| `profile_hash` | VARCHAR(64) | The profile state used for this generation |
| `storage_path` | VARCHAR(255) | S3 path to the markdown file |
| `chapter_version` | INTEGER | Version of the source textbook chapter |
| `created_at` | TIMESTAMP | Generation timestamp |

**Unique Constraint**: `(user_id, chapter_id, profile_hash)`

## State Transitions

### Profile Update Flow
1. User updates background in UI.
2. Backend calculates new `profile_hash`.
3. Backend updates `user_profiles`.
4. Previous user-specific entries in `personalized_chapters` become "stale" (mismatched hash).
5. Next visit to a chapter triggers a new personalization if no cache entry matches the new hash.
