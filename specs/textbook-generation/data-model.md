# Data Model: Textbook Generation

**Feature**: textbook-generation
**Date**: 2025-12-01
**Status**: Complete

## Overview

This document defines the data entities, relationships, and validation rules for the textbook generation system. The data model is split across three storage systems:
1. **Markdown files** (source of truth for chapter content)
2. **Qdrant** (vector embeddings and chunk payloads)
3. **Neon PostgreSQL** (chunk metadata and query logs)

## Entity Diagram

```text
                    ┌─────────────┐
                    │   Chapter   │
                    │  (Markdown) │
                    └──────┬──────┘
                           │ 1:N
                           │
                    ┌──────▼──────┐
                    │   Section   │
                    │  (Markdown) │
                    └──────┬──────┘
                           │ 1:N
                           │
                  ┌────────▼────────┐
                  │  ContentChunk   │
                  │ (Qdrant+Neon)   │
                  └────────┬────────┘
                           │ N:M
                           │
                    ┌──────▼──────┐
                    │  ChatQuery  │
                    │    (Neon)   │
                    └──────┬──────┘
                           │ 1:1
                           │
                 ┌─────────▼──────────┐
                 │   ChatResponse     │
                 │      (Neon)        │
                 └────────────────────┘
```

## Entities

### 1. Chapter (Source: Markdown Files)

**Description**: A complete learning module in the textbook, stored as a markdown file in `website/docs/`.

**File Naming Convention**: `chapter-{N}-{slug}.md`
- Example: `chapter-1-introduction-to-physical-ai.md`

**Attributes**:
- `id` (integer): Chapter number (1-6)
- `title` (string): Human-readable chapter title
  - Example: "Introduction to Physical AI"
- `slug` (string): URL-safe identifier
  - Example: "introduction-to-physical-ai"
- `file_path` (string): Relative path from repo root
  - Example: "website/docs/chapter-1-introduction-to-physical-ai.md"
- `content` (markdown string): Full chapter content
- `metadata` (object):
  - `reading_time_minutes` (integer): Estimated reading time
  - `difficulty_level` (enum): "beginner" | "intermediate" | "advanced"
  - `author` (string): Chapter author name
  - `last_updated` (ISO 8601 date): Last modification date

**Required Sections** (enforced by constitution):
1. Learning Objectives (H2)
2. Introduction (H2)
3. Core Concepts (H2, with H3 subsections)
4. Practical Application (H2)
5. Summary (H2)
6. Further Reading (H2)

**Validation Rules**:
- Chapter ID must be 1-6 (exactly 6 chapters)
- Title must be 3-60 characters
- Slug must match pattern: `[a-z0-9-]+`
- Content must be 10-25 pages (approx. 3,000-7,500 words)
- Content must include all required sections in order
- All code blocks must specify language (e.g., ```python, ```typescript)
- All images must have alt text

**Relationships**:
- Contains 1:N **Sections**
- Generates N **ContentChunks** (via indexing pipeline)

---

### 2. Section (Source: Markdown Headers)

**Description**: A major content division within a chapter (H2 or H3 heading). Not stored separately but extracted during indexing.

**Attributes**:
- `id` (string): Hierarchical identifier
  - Format: `{chapter_id}.{section_number}[.{subsection_number}]`
  - Example: "1.2" (Chapter 1, Section 2) or "1.2.1" (Chapter 1, Section 2, Subsection 1)
- `title` (string): Section heading text
  - Example: "Core Concepts" or "What is Physical AI?"
- `heading_level` (integer): Markdown heading depth (2-4)
  - H2 = major section, H3 = subsection, H4 = sub-subsection
- `content` (markdown string): All content under this heading until next heading of same or higher level
- `parent_chapter_id` (integer): Reference to parent chapter (1-6)
- `parent_section_id` (string | null): Reference to parent section if subsection

**Validation Rules**:
- Heading levels must not skip (no H2 → H4 without H3)
- Section title must be 3-100 characters
- Content must be 100-2000 words per section

**Relationships**:
- Belongs to 1 **Chapter**
- May contain N **Subsections** (nested sections)
- Generates 1-N **ContentChunks** (via semantic chunking)

---

### 3. ContentChunk (Storage: Qdrant + Neon)

**Description**: A semantic unit of content optimized for RAG retrieval. Stored as a vector in Qdrant (with payload) and metadata record in Neon.

**Qdrant Collection**: `textbook_chunks`

**Attributes (Qdrant Payload)**:
- `chunk_id` (UUID): Unique identifier
  - Example: "550e8400-e29b-41d4-a716-446655440000"
- `chapter_id` (integer): Parent chapter number (1-6)
- `chapter_title` (string): "Introduction to Physical AI"
- `section_id` (string): Hierarchical section ID ("1.2.1")
- `section_title` (string): "What is Physical AI?"
- `content` (string): Plain text content (no markdown)
  - Stripped of formatting but preserves code blocks
- `content_markdown` (string): Original markdown with formatting
- `content_type` (enum): "text" | "code" | "table" | "list"
- `token_count` (integer): Number of tokens in content (used for chunking)
- `page_number` (integer): Approximate page number in rendered PDF
- `embedding` (float array): 384-dimensional vector (stored in Qdrant's vector field, not payload)
- `created_at` (ISO 8601): Timestamp when chunk was indexed

**Attributes (Neon PostgreSQL Table: `chunk_metadata`)**:
- `chunk_id` (UUID, PRIMARY KEY): Same as Qdrant
- `chapter_id` (INTEGER, FOREIGN KEY)
- `section_id` (VARCHAR(20))
- `source_file` (VARCHAR(255)): Original markdown file path
- `token_count` (INTEGER)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Validation Rules**:
- Token count must be 100-512 tokens
- Content must not be empty
- Chapter ID must reference valid chapter (1-6)
- Section ID must match pattern: `^\d+(\.\d+)*$`
- Content type must be one of allowed enums

**Relationships**:
- Belongs to 1 **Chapter**
- Belongs to 1 **Section**
- Referenced by N **ChatQuery** results (M:N relationship via query logs)

**Indexes (Qdrant)**:
- HNSW index on embedding vector (ef_construct=100, m=16)

**Indexes (Neon)**:
- Index on `chapter_id` (for filtering queries by chapter)
- Index on `created_at` (for chronological queries)

---

### 4. ChatQuery (Storage: Neon PostgreSQL)

**Description**: A user question submitted to the RAG chatbot, logged for monitoring and analytics.

**Table**: `chat_queries`

**Attributes**:
- `query_id` (UUID, PRIMARY KEY): Unique identifier
- `user_ip_hash` (VARCHAR(64)): SHA256 hash of user IP (privacy)
  - Example: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
- `question` (TEXT): Original user question (sanitized)
  - Max length: 1000 characters
- `question_hash` (VARCHAR(64)): SHA256 hash of question (for deduplication analysis)
- `context` (TEXT, nullable): Selected text provided as context
  - Max length: 2000 characters (500 words)
- `embedding` (NOT STORED): Generated on-the-fly, not persisted
- `retrieved_chunk_ids` (JSONB): Array of chunk UUIDs returned from Qdrant
  - Example: `["550e8400-e29b-41d4-a716-446655440000", "..."]`
- `response_time_ms` (INTEGER): Time to generate response (milliseconds)
- `status` (ENUM): "success" | "error" | "rate_limited" | "timeout"
- `error_message` (TEXT, nullable): Error details if status != "success"
- `created_at` (TIMESTAMPTZ): Query timestamp (UTC)

**Validation Rules**:
- Question must be 3-1000 characters
- User IP hash must be 64 characters (SHA256)
- Retrieved chunk IDs must be valid UUIDs
- Response time must be positive integer
- Status must be one of allowed enums

**Relationships**:
- Has 1:1 **ChatResponse** (if status = "success")
- References N **ContentChunks** via `retrieved_chunk_ids`

**Indexes**:
- Index on `user_ip_hash` (for rate limiting lookups)
- Index on `created_at` (for analytics queries)
- Index on `status` (for error rate monitoring)

---

### 5. ChatResponse (Storage: Neon PostgreSQL)

**Description**: An answer generated by the RAG chatbot with source attributions.

**Table**: `chat_responses`

**Attributes**:
- `response_id` (UUID, PRIMARY KEY): Unique identifier
- `query_id` (UUID, FOREIGN KEY → chat_queries): Parent query
- `answer` (TEXT): Generated answer text
  - Max length: 2000 characters
- `sources` (JSONB): Array of source citations
  - Schema: `[{"chapter": "1", "section": "Introduction", "page": 3, "confidence": 0.92, "chunk_id": "uuid"}]`
- `confidence` (FLOAT): Average confidence across all sources (0.0-1.0)
- `model_version` (VARCHAR(50)): Embedding model version for reproducibility
  - Example: "all-MiniLM-L6-v2"
- `generated_at` (TIMESTAMPTZ): Response timestamp (UTC)

**Validation Rules**:
- Answer must not be empty
- Sources array must contain 1-5 items
- Each source must have valid chapter (1-6), section ID, and confidence (0-1)
- Confidence must be 0.0-1.0
- Model version must not be empty

**Relationships**:
- Belongs to 1 **ChatQuery**
- References N **ContentChunks** via `sources.chunk_id`

**Indexes**:
- Index on `query_id` (for joining with queries)
- Index on `generated_at` (for analytics)

---

### 6. UserProfile (Storage: Neon PostgreSQL, **Phase 2 only**)

**Description**: Learner preferences and progress tracking. **Not implemented in Phase 1.**

**Table**: `user_profiles` (deferred to Phase 2)

**Attributes**:
- `user_id` (UUID, PRIMARY KEY)
- `experience_level` (ENUM): "beginner" | "intermediate" | "advanced"
- `preferred_language` (ENUM): "english" | "urdu"
- `bookmarks` (JSONB): Array of `{"chapter_id": 1, "section_id": "1.2.3"}`
- `reading_progress` (JSONB): Object mapping chapter_id to percentage_read
  - Example: `{"1": 100, "2": 45, "3": 0}`
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Note**: This entity is deferred to Phase 2. Phase 1 uses anonymous access only.

---

## State Transitions

### ContentChunk Lifecycle

```text
1. [Markdown Source] → Parse → Extract Sections
2. [Sections] → Semantic Chunking → ContentChunks
3. [ContentChunks] → Generate Embeddings → Store in Qdrant
4. [ContentChunks] → Extract Metadata → Store in Neon
```

**States**: `pending` → `indexed` → `active`
- `pending`: Chapter created but not yet indexed
- `indexed`: Chunks created and stored in Qdrant + Neon
- `active`: Ready for queries

### ChatQuery Lifecycle

```text
1. [User Input] → Sanitize → ChatQuery (status: processing)
2. [ChatQuery] → Generate Embedding → Query Qdrant
3. [Qdrant Results] → Re-rank → Select Top 3
4. [Top Chunks] → Construct Context → Generate Response
5. [Response] → Store ChatResponse → Update status: success
```

**States**: `processing` → `success` | `error` | `rate_limited` | `timeout`

---

## Database Schema (Neon PostgreSQL)

```sql
-- Chunk metadata table
CREATE TABLE chunk_metadata (
  chunk_id UUID PRIMARY KEY,
  chapter_id INTEGER NOT NULL CHECK (chapter_id BETWEEN 1 AND 6),
  section_id VARCHAR(20) NOT NULL,
  source_file VARCHAR(255) NOT NULL,
  token_count INTEGER NOT NULL CHECK (token_count BETWEEN 100 AND 512),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chunk_chapter ON chunk_metadata(chapter_id);
CREATE INDEX idx_chunk_created ON chunk_metadata(created_at);

-- Chat queries table
CREATE TABLE chat_queries (
  query_id UUID PRIMARY KEY,
  user_ip_hash VARCHAR(64) NOT NULL,
  question TEXT NOT NULL CHECK (LENGTH(question) BETWEEN 3 AND 1000),
  question_hash VARCHAR(64) NOT NULL,
  context TEXT,
  retrieved_chunk_ids JSONB NOT NULL DEFAULT '[]',
  response_time_ms INTEGER NOT NULL CHECK (response_time_ms > 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'rate_limited', 'timeout')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_query_ip_hash ON chat_queries(user_ip_hash);
CREATE INDEX idx_query_created ON chat_queries(created_at);
CREATE INDEX idx_query_status ON chat_queries(status);

-- Chat responses table
CREATE TABLE chat_responses (
  response_id UUID PRIMARY KEY,
  query_id UUID NOT NULL REFERENCES chat_queries(query_id) ON DELETE CASCADE,
  answer TEXT NOT NULL CHECK (LENGTH(answer) > 0),
  sources JSONB NOT NULL,
  confidence FLOAT NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
  model_version VARCHAR(50) NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_response_query ON chat_responses(query_id);
CREATE INDEX idx_response_generated ON chat_responses(generated_at);
```

---

## Qdrant Collection Schema

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(url="https://xyz.qdrant.io", api_key="...")

client.create_collection(
    collection_name="textbook_chunks",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
    # HNSW index configuration for fast search
    hnsw_config={"m": 16, "ef_construct": 100}
)
```

**Payload Schema**:
```json
{
  "chunk_id": "550e8400-e29b-41d4-a716-446655440000",
  "chapter_id": 1,
  "chapter_title": "Introduction to Physical AI",
  "section_id": "1.2",
  "section_title": "What is Physical AI?",
  "content": "Physical AI refers to artificial intelligence systems...",
  "content_markdown": "**Physical AI** refers to artificial intelligence...",
  "content_type": "text",
  "token_count": 342,
  "page_number": 3,
  "created_at": "2025-12-01T12:00:00Z"
}
```

---

## Next Steps

1. Generate API contracts (`contracts/openapi.yaml` and `contracts/rag-pipeline.md`)
2. Generate quickstart guide (`quickstart.md`)
3. Implement data models in code:
   - SQLAlchemy models in `backend/app/models/entities.py`
   - Pydantic schemas in `backend/app/models/schemas.py`
   - Qdrant collection initialization in `backend/scripts/setup_qdrant.py`
   - Neon schema migration in `backend/scripts/setup_db.py`
