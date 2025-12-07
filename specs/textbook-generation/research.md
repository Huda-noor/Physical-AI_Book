# Research Document: Textbook Generation

**Feature**: textbook-generation
**Date**: 2025-12-01
**Status**: Complete

## Overview

This document captures technology decisions, best practices, and integration patterns for building an AI-Native textbook with RAG chatbot capabilities.

## Technology Decisions

### 1. Static Site Generator: Docusaurus 3.x

**Decision**: Use Docusaurus 3.5.x for static site generation

**Rationale**:
- **Battle-tested**: Used by Facebook, Meta, and thousands of open-source projects
- **Built-in features**: Auto-generated sidebar, search, responsive layout, dark mode support
- **React-based**: Easy to add custom components (chatbot modal, text selection UI)
- **MDX support**: Allows embedding React components in markdown
- **Fast builds**: Optimized for large documentation sites with hundreds of pages
- **Free deployment**: Deploys to GitHub Pages with single command

**Alternatives Considered**:
- **VitePress**: Faster builds but less mature React ecosystem
- **Next.js**: More powerful but overkill for static content, harder to deploy for free
- **MkDocs**: Python-based, less flexible for custom UI components
- **GitBook**: SaaS-only, not free-tier compatible

**Best Practices**:
- Use `@docusaurus/preset-classic` for standard configuration
- Organize chapters in `/docs` directory with clear file naming (`chapter-N-slug.md`)
- Use `sidebars.ts` for manual sidebar control (better than auto-generation for textbook structure)
- Customize theme via `/src/theme` components (non-breaking overrides)
- Keep bundle size <200KB by code-splitting and lazy-loading components

**Integration Points**:
- Custom React components in `/src/components` for chatbot UI
- Theme overrides in `/src/theme/Root.tsx` for global chatbot state provider
- Environment variables in `docusaurus.config.ts` for backend API URL

---

### 2. Embedding Model: sentence-transformers/all-MiniLM-L6-v2

**Decision**: Use `all-MiniLM-L6-v2` for generating 384-dimensional embeddings

**Rationale**:
- **Lightweight**: Model size 80MB, runs efficiently on CPU (<500ms per query)
- **Free-tier compatible**: No GPU required, low memory footprint
- **Good accuracy**: Performs well on semantic similarity tasks (STS benchmark ~82%)
- **Fast inference**: Processes 100 sentences in ~2 seconds on modern CPU
- **Wide adoption**: Well-documented, active community support

**Alternatives Considered**:
- **OpenAI text-embedding-ada-002**: Better accuracy but not free (costs $0.0001/1K tokens)
- **BAAI/bge-small-en-v1.5**: Similar size and performance, valid alternative
- **all-mpnet-base-v2**: Higher accuracy (768-dim) but 2x model size, slower inference
- **instructor-xl**: Best accuracy but 5GB model size, requires GPU

**Best Practices**:
- Cache model on disk after first download (use `TRANSFORMERS_CACHE` env var)
- Use batch encoding for indexing (process 32 chunks at once for 3x speedup)
- Normalize embeddings before storing in Qdrant (cosine similarity requires unit vectors)
- Set `device='cpu'` explicitly in sentence-transformers to avoid GPU detection overhead

**Integration Points**:
- Load model once at FastAPI startup (avoid reloading on each request)
- Expose encoding function via `services/embeddings.py` wrapper
- Share model instance across requests using dependency injection

---

### 3. Vector Database: Qdrant Community Cloud

**Decision**: Use Qdrant Cloud free tier for vector storage

**Rationale**:
- **Free tier**: 1GB storage, sufficient for ~3000 chunks (384-dim vectors)
- **High performance**: <200ms search latency for top-k=5 queries
- **Rich filtering**: Supports metadata filters (filter by chapter_id, content_type)
- **Python client**: Official `qdrant-client` library with asyncio support
- **Managed service**: No infrastructure management, automatic backups

**Alternatives Considered**:
- **Pinecone**: Not free-tier compatible (requires credit card)
- **Weaviate**: More complex setup, heavier resource usage
- **Chroma**: Local-only, doesn't scale to multiple backend instances
- **FAISS**: CPU-only, no managed hosting, requires manual persistence

**Best Practices**:
- Create single collection `textbook_chunks` with 384-dim vectors
- Use payload for metadata (chapter_id, section_title, content, page_number)
- Enable HNSW indexing for fast approximate nearest neighbor search
- Set `ef_construct=100` and `m=16` for balanced speed/accuracy
- Use batch upsert for indexing (100 vectors at once)

**Integration Points**:
- Initialize client in `services/qdrant_client.py` with API key from env
- Implement `search_similar_chunks(query_vector, top_k=5)` method
- Add metadata filters for advanced queries (e.g., search within specific chapter)

---

### 4. Metadata Store: Neon PostgreSQL

**Decision**: Use Neon Postgres free tier for chunk metadata and query logs

**Rationale**:
- **Free tier**: 0.5GB storage, 100 hours compute/month (sufficient for ~1000 queries/day)
- **Serverless**: Auto-scales to zero when idle, restarts in <1s
- **Postgres compatibility**: Standard SQL, works with psycopg2 and SQLAlchemy
- **Low latency**: <50ms queries from most regions
- **Branching**: Free database branches for testing

**Alternatives Considered**:
- **Supabase**: Similar offering but less generous free tier (500MB limit applies to all databases)
- **PlanetScale**: MySQL-based, different ecosystem, less Python tooling
- **SQLite**: Local-only, doesn't work with serverless backend deployments
- **Firebase**: NoSQL, harder to model relational data (chunks, queries, logs)

**Best Practices**:
- Use connection pooling (SQLAlchemy `create_engine` with `pool_size=5`)
- Create indexes on frequently queried columns (`chunk_id`, `chapter_id`, `created_at`)
- Store large text (chunk content) in Qdrant payload, only IDs in Postgres
- Use TIMESTAMPTZ for all timestamp columns (UTC timezone)
- Enable query logging for monitoring (but hash user queries for privacy)

**Integration Points**:
- Initialize connection in `services/neon_client.py` with DATABASE_URL from env
- Define SQLAlchemy models in `models/entities.py`
- Implement `log_query(query_id, question_hash, response_time_ms)` method

---

### 5. Backend Framework: FastAPI

**Decision**: Use FastAPI 0.110+ for backend API

**Rationale**:
- **High performance**: Built on Starlette/Uvicorn, async support, ~10K req/s on single core
- **Type safety**: Pydantic models for request/response validation
- **Auto-generated docs**: OpenAPI/Swagger UI at `/docs` endpoint
- **Easy testing**: TestClient for unit tests, supports pytest fixtures
- **Modern Python**: Leverages type hints, async/await, dependency injection

**Alternatives Considered**:
- **Flask**: Synchronous by default, slower, less modern
- **Django**: Too heavy for simple API, more suited for full web apps
- **Sanic**: Similar performance but smaller community, less mature
- **Express.js (Node)**: Different ecosystem, less Python library compatibility

**Best Practices**:
- Use dependency injection for shared resources (Qdrant client, DB connection)
- Implement middleware for rate limiting and CORS
- Use Pydantic models for all request/response schemas
- Enable CORS with explicit allowed origins (avoid `allow_origins=["*"]`)
- Add health check endpoint (`/api/health`) for monitoring

**Integration Points**:
- Define routers in `routers/query.py` and `routers/health.py`
- Mount middleware in `main.py` (rate limiting, CORS, logging)
- Use `lifespan` context manager for startup/shutdown tasks (load embedding model)

---

### 6. Frontend-Backend Communication

**Decision**: REST API with JSON over HTTPS

**Rationale**:
- **Simplicity**: Standard HTTP methods (GET, POST), no WebSocket complexity
- **Caching**: Can cache GET responses (health checks)
- **CORS-friendly**: Works with GitHub Pages origin
- **Testable**: Easy to test with curl, Postman, or pytest
- **Free-tier compatible**: All hosting platforms support standard HTTP

**Alternatives Considered**:
- **GraphQL**: Overkill for simple query endpoint
- **gRPC**: Requires binary protocol, not browser-friendly
- **WebSocket**: Real-time not needed, adds complexity

**Best Practices**:
- Use POST `/api/query` for chatbot queries (not GET with query params)
- Return 400 for invalid input, 429 for rate limit, 500 for server errors
- Include `Retry-After` header in 429 responses
- Set `Content-Type: application/json` explicitly
- Use exponential backoff for retries on client side (3 attempts max)

**Request Schema**:
```json
{
  "question": "What is Physical AI?",
  "context": "optional selected text",
  "max_results": 5
}
```

**Response Schema**:
```json
{
  "answer": "Physical AI refers to...",
  "sources": [
    {"chapter": "1", "section": "Introduction", "page": 3, "confidence": 0.92}
  ],
  "confidence": 0.89,
  "response_time_ms": 1243
}
```

---

### 7. Text Chunking Strategy

**Decision**: Semantic chunking with respect to heading hierarchy

**Rationale**:
- **Preserves meaning**: Chunks align with logical sections (not arbitrary 512-token splits)
- **Better retrieval**: Queries match complete thoughts, not mid-sentence fragments
- **Source attribution**: Each chunk maps cleanly to a specific section/subsection
- **Embedding quality**: Complete paragraphs produce better embeddings than fragments

**Implementation**:
1. Parse markdown into AST (Abstract Syntax Tree)
2. Identify heading boundaries (H2, H3, H4)
3. Group paragraphs under each heading
4. Split if section exceeds 512 tokens (keep heading + first N paragraphs)
5. Add 50-token overlap between adjacent chunks (repeat last paragraph of chunk N in chunk N+1)

**Best Practices**:
- Use `markdown-it-py` for parsing markdown
- Track heading hierarchy in metadata (`section_path: "1.2.3"`)
- Store original markdown in Qdrant payload (for citation rendering)
- Min chunk size: 100 tokens (avoid tiny chunks with low information density)
- Max chunk size: 512 tokens (balance between context and retrieval precision)

**Example**:
```text
# Chapter 3: ROS 2 Fundamentals

## Core Concepts

### Nodes
A node is the fundamental building block...
[paragraph 1]
[paragraph 2]

### Topics
Topics enable asynchronous communication...
[paragraph 1]

Chunk 1: "Core Concepts > Nodes" (heading + 2 paragraphs, 420 tokens)
Chunk 2: "Core Concepts > Topics" (heading + 1 paragraph, 280 tokens)
```

---

### 8. Rate Limiting Strategy

**Decision**: IP-based rate limiting with 10 requests/minute per IP

**Rationale**:
- **Free-tier protection**: Prevents abuse that could exceed Qdrant/Neon limits
- **Simple implementation**: Use `slowapi` library with in-memory storage
- **No authentication needed**: Works without user accounts
- **Fair usage**: 10 req/min allows legitimate use (6s between queries)

**Alternatives Considered**:
- **User-based**: Requires authentication (out of scope for Phase 1)
- **Token bucket**: More complex, unnecessary for current scale
- **API keys**: Adds friction, not needed for public textbook

**Best Practices**:
- Return 429 status with `Retry-After` header (seconds until next allowed request)
- Use Redis for distributed rate limiting if scaling to multiple backend instances
- Log rate limit violations for monitoring (detect potential attacks)
- Provide clear error message: "Rate limit exceeded. Please wait X seconds."

**Implementation**:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/query")
@limiter.limit("10/minute")
async def query(request: Request, query_data: QueryRequest):
    ...
```

---

### 9. Deployment Strategy

**Decision**:
- **Frontend**: GitHub Pages (static site hosting)
- **Backend**: Railway free tier (first choice) or Render free tier (fallback)

**Rationale**:
- **GitHub Pages**: Free, unlimited bandwidth, CDN-backed, auto-deploys from main branch
- **Railway**: 500 hours/month free, easy setup, auto-deploys from GitHub
- **Render**: Alternative with similar free tier, good fallback if Railway unavailable

**Best Practices**:
- Use GitHub Actions for CI/CD (build, test, deploy on every commit to main)
- Set up branch protection (require PR approval, CI checks pass)
- Use environment secrets for API keys (QDRANT_API_KEY, DATABASE_URL)
- Deploy backend first, then update frontend with backend URL

**GitHub Actions Workflow**:
1. **frontend-deploy.yml**: Build Docusaurus, deploy to `gh-pages` branch
2. **backend-deploy.yml**: Build Docker image, push to Railway/Render
3. **test.yml**: Run pytest (backend) and Jest (frontend) on every PR

---

### 10. Monitoring and Observability

**Decision**: Minimal observability with structured logging and health checks

**Rationale**:
- **Free-tier friendly**: No paid monitoring tools (Datadog, New Relic)
- **Sufficient for Phase 1**: Logs capture errors, health checks detect downtime
- **Scalable**: Can add Sentry (free tier) later for error tracking

**Best Practices**:
- Use Python `logging` module with JSON formatter (structured logs)
- Log all API requests with timestamp, method, endpoint, status, duration
- Log all errors with stack traces and context
- Implement `/api/health` endpoint that checks Qdrant and Neon connectivity
- Monitor health endpoint with UptimeRobot (free, 50 monitors)

**Health Check Response**:
```json
{
  "status": "healthy",
  "services": {
    "qdrant": "connected",
    "neon": "connected",
    "embedding_model": "loaded"
  },
  "timestamp": "2025-12-01T12:00:00Z"
}
```

---

## Open Questions

None - all technology decisions resolved.

## Next Steps

1. Generate `data-model.md` (Phase 1)
2. Generate API contracts in `/contracts` (Phase 1)
3. Generate `quickstart.md` (Phase 1)
4. Create feature branch `001-textbook-generation`
5. Execute `/sp.tasks textbook-generation` to generate task breakdown
