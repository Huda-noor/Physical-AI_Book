# RAG Pipeline Specification

**Feature**: textbook-generation
**Date**: 2025-12-01
**Version**: 1.0.0

## Overview

This document specifies the Retrieval-Augmented Generation (RAG) pipeline for the textbook chatbot. The pipeline consists of two main phases:
1. **Indexing**: Process chapter markdown files and store embeddings in Qdrant
2. **Query**: Retrieve relevant chunks and construct answers with source citations

## Indexing Pipeline

### Purpose
Convert chapter markdown files into searchable vector embeddings stored in Qdrant with metadata in Neon PostgreSQL.

### Trigger
- **Manual**: Run `python backend/scripts/index_chapters.py` after content changes
- **Automated (future)**: GitHub Actions workflow on push to `main` branch affecting `/website/docs/*.md`

### Input
- Chapter markdown files in `website/docs/chapter-*.md`
- Expected: 6 files, each 10-25 pages

### Output
- Vectors stored in Qdrant collection `textbook_chunks`
- Metadata records in Neon table `chunk_metadata`
- Index report: `{chapter_count, chunk_count, total_tokens, duration_seconds}`

### Steps

#### Step 1: Parse Markdown Files

**Tool**: `markdown-it-py` or `mistune`

**Process**:
1. Read all files matching `website/docs/chapter-*.md`
2. Parse markdown into Abstract Syntax Tree (AST)
3. Extract heading hierarchy (H1, H2, H3, H4)
4. Extract metadata from front matter (if present)

**Output**: List of `Chapter` objects with parsed sections

**Error Handling**:
- If file not found: Log error, skip file
- If markdown syntax error: Fail fast with clear error message (line number)
- If heading hierarchy invalid (e.g., H2 → H4): Log warning, continue

---

#### Step 2: Semantic Chunking

**Purpose**: Split chapter content into semantic units that fit within 512 tokens while preserving meaning.

**Algorithm**:
```python
def semantic_chunking(chapter: Chapter) -> List[Chunk]:
    chunks = []
    for section in chapter.sections:
        current_chunk = {"heading": section.title, "paragraphs": []}
        token_count = count_tokens(section.title)

        for paragraph in section.paragraphs:
            paragraph_tokens = count_tokens(paragraph)

            if token_count + paragraph_tokens > 512:
                # Current chunk is full, save it
                if current_chunk["paragraphs"]:
                    chunks.append(finalize_chunk(current_chunk, chapter))

                # Start new chunk with 50-token overlap
                overlap_text = get_last_n_tokens(current_chunk["paragraphs"], 50)
                current_chunk = {
                    "heading": section.title,
                    "paragraphs": [overlap_text, paragraph]
                }
                token_count = count_tokens(overlap_text) + paragraph_tokens
            else:
                current_chunk["paragraphs"].append(paragraph)
                token_count += paragraph_tokens

        # Save remaining chunk
        if current_chunk["paragraphs"]:
            chunks.append(finalize_chunk(current_chunk, chapter))

    return chunks
```

**Constraints**:
- Min chunk size: 100 tokens (discard smaller chunks)
- Max chunk size: 512 tokens
- Overlap: 50 tokens between adjacent chunks (repeat last paragraph)
- Preserve heading context in each chunk

**Special Handling**:
- **Code blocks**: Treat as single unit (don't split mid-code)
- **Tables**: Treat as single unit
- **Lists**: Keep list items together if possible

**Output**: List of `ContentChunk` objects with metadata

---

#### Step 3: Generate Embeddings

**Model**: `sentence-transformers/all-MiniLM-L6-v2`
**Vector Dimensions**: 384
**Device**: CPU (no GPU)

**Process**:
1. Load model once at script start (cache to disk)
   ```python
   from sentence_transformers import SentenceTransformer
   model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
   ```

2. Batch encode chunks (32 chunks at a time for efficiency)
   ```python
   texts = [chunk.content for chunk in chunks]
   embeddings = model.encode(
       texts,
       batch_size=32,
       show_progress_bar=True,
       normalize_embeddings=True  # Unit vectors for cosine similarity
   )
   ```

3. Validate embeddings (shape, no NaNs)
   ```python
   assert embeddings.shape == (len(chunks), 384)
   assert not np.isnan(embeddings).any()
   ```

**Performance**:
- Expected: ~100 chunks in 10-15 seconds on modern CPU (i5/Ryzen 5)
- Timeout: 60 seconds (fail if exceeded)

**Error Handling**:
- If model download fails: Retry once, then fail with clear message
- If encoding fails: Log chunk ID, skip chunk, continue
- If all chunks fail: Abort indexing

---

#### Step 4: Store in Qdrant

**Collection**: `textbook_chunks`
**Vector Config**: 384 dimensions, cosine distance, HNSW index

**Process**:
1. Connect to Qdrant Cloud
   ```python
   from qdrant_client import QdrantClient
   client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
   ```

2. Create collection if not exists
   ```python
   from qdrant_client.models import Distance, VectorParams

   client.recreate_collection(
       collection_name="textbook_chunks",
       vectors_config=VectorParams(size=384, distance=Distance.COSINE),
       hnsw_config={"m": 16, "ef_construct": 100}
   )
   ```

3. Batch upsert vectors (100 at a time)
   ```python
   from qdrant_client.models import PointStruct

   points = [
       PointStruct(
           id=str(chunk.chunk_id),
           vector=embedding.tolist(),
           payload={
               "chapter_id": chunk.chapter_id,
               "chapter_title": chunk.chapter_title,
               "section_id": chunk.section_id,
               "section_title": chunk.section_title,
               "content": chunk.content,
               "content_markdown": chunk.content_markdown,
               "content_type": chunk.content_type,
               "token_count": chunk.token_count,
               "page_number": chunk.page_number,
               "created_at": chunk.created_at.isoformat()
           }
       )
       for chunk, embedding in zip(chunks, embeddings)
   ]

   client.upsert(collection_name="textbook_chunks", points=points)
   ```

**Error Handling**:
- If connection fails: Retry 3 times with exponential backoff, then fail
- If upsert fails: Log batch, retry once, then skip batch
- If collection full (>1GB): Fail with clear message about free-tier limit

---

#### Step 5: Store Metadata in Neon

**Table**: `chunk_metadata`

**Process**:
1. Connect to Neon PostgreSQL
   ```python
   import psycopg2
   conn = psycopg2.connect(DATABASE_URL)
   cursor = conn.cursor()
   ```

2. Batch insert metadata (100 rows at a time)
   ```python
   sql = """
   INSERT INTO chunk_metadata
     (chunk_id, chapter_id, section_id, source_file, token_count, created_at, updated_at)
   VALUES (%s, %s, %s, %s, %s, %s, %s)
   ON CONFLICT (chunk_id) DO UPDATE SET
     updated_at = EXCLUDED.updated_at
   """

   cursor.executemany(sql, [
       (chunk.chunk_id, chunk.chapter_id, chunk.section_id, chunk.source_file,
        chunk.token_count, chunk.created_at, chunk.updated_at)
       for chunk in chunks
   ])
   conn.commit()
   ```

**Error Handling**:
- If connection fails: Retry 3 times, then fail
- If insert fails: Log error, rollback transaction, fail

---

#### Step 6: Generate Index Report

**Output**:
```json
{
  "status": "success",
  "chapters_processed": 6,
  "total_chunks": 287,
  "total_tokens": 98543,
  "chunks_per_chapter": {
    "1": 45,
    "2": 52,
    "3": 61,
    "4": 58,
    "5": 43,
    "6": 28
  },
  "duration_seconds": 23.4,
  "qdrant_storage_mb": 42.3,
  "timestamp": "2025-12-01T12:00:00Z"
}
```

---

## Query Pipeline

### Purpose
Retrieve relevant chunks for a user question and return answer with source citations.

### Trigger
- HTTP POST request to `/api/query` endpoint

### Input
- `QueryRequest` object:
  ```json
  {
    "question": "What is Physical AI?",
    "context": "optional selected text",
    "max_results": 5
  }
  ```

### Output
- `QueryResponse` object:
  ```json
  {
    "answer": "Physical AI refers to...",
    "sources": [
      {"chapter": "1", "section": "Introduction", "page": 3, "confidence": 0.92, "chunk_id": "uuid"}
    ],
    "confidence": 0.89,
    "response_time_ms": 1243
  }
  ```

### Steps

#### Step 1: Input Validation & Sanitization

**Validations**:
- Question length: 3-1000 characters
- Context length: 0-2000 characters (500 words)
- Max results: 1-10

**Sanitization**:
- Strip HTML tags: `re.sub(r'<[^>]+>', '', text)`
- Remove excessive whitespace: `re.sub(r'\s+', ' ', text).strip()`
- Block injection attempts: Reject if contains `<script>`, SQL keywords in unexpected places

**Error Response**:
```json
{
  "error": "Invalid request",
  "message": "Question must be between 3 and 1000 characters",
  "status_code": 400
}
```

---

#### Step 2: Rate Limiting Check

**Limit**: 10 requests per minute per IP address

**Implementation** (using `slowapi`):
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/query")
@limiter.limit("10/minute")
async def query(request: Request, query_data: QueryRequest):
    ...
```

**Error Response** (if exceeded):
```json
{
  "error": "Rate limit exceeded",
  "message": "Maximum 10 requests per minute. Please wait 45 seconds.",
  "status_code": 429,
  "retry_after": 45
}
```

**Headers**: `Retry-After: 45` (seconds)

---

#### Step 3: Generate Query Embedding

**Process**:
1. Combine question + context (if provided)
   ```python
   query_text = f"{question}\n\nContext: {context}" if context else question
   ```

2. Generate embedding
   ```python
   query_embedding = model.encode(
       query_text,
       convert_to_numpy=True,
       normalize_embeddings=True
   )
   ```

**Performance**: <500ms on CPU

**Error Handling**:
- If encoding fails: Return 500 error with message "Failed to process query"

---

#### Step 4: Semantic Search in Qdrant

**Query Parameters**:
- Collection: `textbook_chunks`
- Query vector: 384-dimensional embedding
- Top-k: User-specified (default 5, max 10)
- Score threshold: 0.5 (filter out low-relevance results)

**Process**:
```python
from qdrant_client.models import SearchRequest

search_result = client.search(
    collection_name="textbook_chunks",
    query_vector=query_embedding.tolist(),
    limit=max_results,
    score_threshold=0.5,
    with_payload=True
)
```

**Output**: List of `ScoredPoint` objects with:
- `id`: Chunk UUID
- `score`: Cosine similarity (0.0-1.0)
- `payload`: Chunk metadata (chapter_id, section_title, content, etc.)

**Performance**: <200ms (p95)

**Error Handling**:
- If Qdrant unreachable: Return 500 error "Vector database unavailable"
- If no results above threshold: Return empty sources array, message "No relevant content found"

---

#### Step 5: Re-rank Results

**Purpose**: Improve relevance by considering additional factors beyond cosine similarity.

**Re-ranking Factors**:
1. **Cosine similarity** (primary, 70% weight)
2. **Keyword overlap** (20% weight): Count exact keyword matches between query and chunk
3. **Recency** (10% weight): Prefer recent content (if chapters have timestamps)

**Algorithm**:
```python
def rerank_chunks(query: str, chunks: List[ScoredPoint]) -> List[ScoredPoint]:
    query_keywords = set(query.lower().split())

    for chunk in chunks:
        cosine_score = chunk.score

        chunk_keywords = set(chunk.payload["content"].lower().split())
        keyword_overlap = len(query_keywords & chunk_keywords) / max(len(query_keywords), 1)

        # Combine scores (weighted)
        final_score = (
            0.70 * cosine_score +
            0.20 * keyword_overlap +
            0.10 * 1.0  # Recency placeholder (all chapters same age in Phase 1)
        )
        chunk.score = final_score

    # Sort by final score descending
    chunks.sort(key=lambda x: x.score, reverse=True)
    return chunks[:3]  # Return top 3
```

**Output**: Top 3 chunks (down from top-k=5)

---

#### Step 6: Construct Answer with Sources

**Purpose**: Format response with source citations for transparency.

**Process**:
1. Extract top 3 chunks
2. Concatenate chunk content (max 1500 chars total)
3. Construct answer summary (currently: return chunk content; future: LLM-generated summary)
4. Build sources array

**Answer Construction** (Phase 1 - Simple):
```python
def construct_answer(chunks: List[ScoredPoint]) -> str:
    # Simple concatenation with ellipsis
    texts = [chunk.payload["content"][:500] for chunk in chunks]
    answer = " ... ".join(texts)
    return answer[:2000]  # Max 2000 chars
```

**Future Enhancement** (Phase 2 - LLM):
```python
# Use OpenAI API or local LLM to generate coherent answer
answer = generate_summary(query, chunks)
```

**Sources Array**:
```python
sources = [
    {
        "chapter": str(chunk.payload["chapter_id"]),
        "section": chunk.payload["section_title"],
        "page": chunk.payload["page_number"],
        "confidence": round(chunk.score, 2),
        "chunk_id": chunk.id
    }
    for chunk in chunks
]
```

**Confidence Score**: Average of top 3 chunk scores

---

#### Step 7: Log Query to Neon

**Purpose**: Track usage, monitor performance, detect abuse.

**Data**:
- `query_id`: UUID
- `user_ip_hash`: SHA256(user_ip + salt)
- `question_hash`: SHA256(question) for deduplication analysis
- `retrieved_chunk_ids`: JSON array of UUIDs
- `response_time_ms`: Total query duration
- `status`: "success" | "error" | "rate_limited" | "timeout"

**Privacy**: IP is hashed, full question is NOT stored (only hash)

**SQL**:
```sql
INSERT INTO chat_queries
  (query_id, user_ip_hash, question, question_hash, context,
   retrieved_chunk_ids, response_time_ms, status, created_at)
VALUES
  (%(query_id)s, %(user_ip_hash)s, %(question)s, %(question_hash)s, %(context)s,
   %(retrieved_chunk_ids)s::jsonb, %(response_time_ms)s, %(status)s, NOW())
```

**Error Handling**:
- If logging fails: Log error to console, DO NOT fail the request (query succeeds even if logging fails)

---

#### Step 8: Return Response

**Success Response** (HTTP 200):
```json
{
  "answer": "Physical AI refers to artificial intelligence systems...",
  "sources": [
    {"chapter": "1", "section": "Introduction", "page": 3, "confidence": 0.92, "chunk_id": "uuid"}
  ],
  "confidence": 0.89,
  "response_time_ms": 1243
}
```

**Error Response** (HTTP 500):
```json
{
  "error": "Internal server error",
  "message": "Vector database connection timeout",
  "status_code": 500
}
```

---

## Performance Budgets

| Operation | Target | Max |
|-----------|--------|-----|
| Full indexing (6 chapters) | <60s | 120s |
| Query embedding generation | <500ms | 1000ms |
| Qdrant vector search | <200ms | 500ms |
| Total query response | <1000ms (p50) | 2000ms (p95) |

## Error Scenarios & Handling

| Scenario | Detection | Response | User Message |
|----------|-----------|----------|--------------|
| Qdrant unreachable | Connection timeout (5s) | Return 500 | "Chatbot temporarily unavailable" |
| Neon unreachable | Connection timeout (5s) | Return 500, skip logging | "Chatbot temporarily unavailable" |
| Embedding model not loaded | Model None check | Return 500 | "Service starting up, please retry" |
| No relevant chunks found | All scores <0.5 | Return 200 with empty sources | "No relevant content found for your question" |
| Rate limit exceeded | Limiter raises exception | Return 429 with Retry-After header | "Please wait X seconds before next query" |
| Invalid input | Pydantic validation error | Return 400 | "Invalid input: [specific field error]" |

## Testing Strategy

### Indexing Tests
1. **Unit**: Test chunking algorithm with sample markdown
2. **Unit**: Test embedding generation with known text (verify shape)
3. **Integration**: Test Qdrant upsert with mock collection
4. **E2E**: Index sample chapter, verify count and retrieval

### Query Tests
1. **Unit**: Test input sanitization
2. **Unit**: Test re-ranking algorithm
3. **Integration**: Mock Qdrant search, verify response format
4. **E2E**: Query indexed content, verify sources match expected chapters

### Test Data
- Sample chapter: "test-chapter-1.md" with 5 sections
- Expected: ~20 chunks, 3000 tokens
- Test queries: 10 questions with known answers

---

## Next Steps

1. Implement indexing script: `backend/scripts/index_chapters.py`
2. Implement query service: `backend/app/services/rag_service.py`
3. Write tests: `backend/tests/test_rag_service.py`
4. Generate quickstart guide: `quickstart.md`
