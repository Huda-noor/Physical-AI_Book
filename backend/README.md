# Physical AI Textbook - RAG Backend

FastAPI-powered RAG (Retrieval-Augmented Generation) backend for the Physical AI & Humanoid Robotics textbook chatbot.

## Features

- **OpenAI GPT-4o-mini** for intelligent answer generation
- **text-embedding-ada-002** for semantic embeddings (1536 dimensions)
- **Qdrant Cloud** for vector search (free tier compatible)
- **Neon PostgreSQL** for metadata storage (free tier compatible)
- **Selected text mode**: Answer questions based on user-highlighted text
- **Full-book mode**: Search across all 6 chapters
- Rate limiting (10 req/min per IP)
- CORS configured for frontend
- Health checks for all services

## Setup Instructions

### 1. Prerequisites

- Python 3.10+
- OpenAI API key
- Qdrant Cloud account (free)
- Neon PostgreSQL account (free)

### 2. Create Accounts

#### Qdrant Cloud (Free Tier)
1. Go to https://cloud.qdrant.io
2. Sign up for free account
3. Create a cluster (1GB free)
4. Get your cluster URL and API key

#### Neon PostgreSQL (Free Tier)
1. Go to https://neon.tech
2. Sign up for free account
3. Create a project
4. Copy your connection string

#### OpenAI
1. Go to https://platform.openai.com
2. Create an API key
3. Add credits to your account

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxx

# Qdrant Configuration
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# Neon PostgreSQL Configuration
DATABASE_URL=postgresql://user:password@your-instance.neon.tech/textbook_db?sslmode=require

# Model Configuration
EMBEDDING_MODEL=text-embedding-ada-002
LLM_MODEL=gpt-4o-mini

# API Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.vercel.app
RATE_LIMIT_PER_MINUTE=10

# Logging
LOG_LEVEL=INFO
```

### 5. Initialize Database

Run the schema creation script in your Neon database:

```bash
psql $DATABASE_URL < schema.sql
```

Or manually run the SQL in Neon's SQL editor.

### 6. Ingest Textbook Content

Run the ingestion pipeline to index all 6 chapters:

```bash
python -m app.ingest_textbook
```

This will:
- Parse all chapter markdown files
- Chunk content (800 chars with 200 char overlap)
- Generate OpenAI embeddings for each chunk
- Store vectors in Qdrant
- Store metadata in Neon

Expected output:
```
Processing chapter-1-introduction-to-physical-ai.md...
  Chapter 1: Introduction to Physical AI
  Section: What is Physical AI? (12 chunks)
  Section: Key Concepts (8 chunks)
✅ Chapter 1 complete: 45 chunks indexed

...

Ingestion complete: 6/6 chapters indexed
```

### 7. Run the API Server

```bash
# Development mode
python -m app.main

# Production mode with Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 8. Test the API

Check health:
```bash
curl http://localhost:8000/health
```

Test a query:
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is Physical AI?",
    "top_k": 5
  }'
```

Test with selected text:
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain this concept",
    "selected_text": "Physical AI refers to embodied artificial intelligence...",
    "top_k": 5
  }'
```

## API Endpoints

### GET /health
Health check for all services

**Response:**
```json
{
  "status": "healthy",
  "qdrant": "connected",
  "postgres": "connected",
  "embedding_model": "ready",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### POST /api/query
Query the textbook with RAG

**Request:**
```json
{
  "question": "What is Physical AI?",
  "top_k": 5,
  "selected_text": null
}
```

**Response:**
```json
{
  "answer": "Physical AI refers to...",
  "sources": [
    {
      "chunk_id": "uuid",
      "chapter_id": 1,
      "section_id": "1.1",
      "section_title": "Introduction",
      "preview_text": "Physical AI is...",
      "relevance_score": 0.89
    }
  ],
  "query_time_ms": 145
}
```

## Deployment

### Railway (Recommended)

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Create new project: `railway init`
4. Add environment variables in Railway dashboard
5. Deploy:
```bash
railway up
```

### Render

1. Create new Web Service
2. Connect your GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

### Vercel (Serverless)

Create `api/index.py`:
```python
from app.main import app
```

Add `vercel.json`:
```json
{
  "builds": [{ "src": "api/index.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.py" }]
}
```

Deploy: `vercel --prod`

## Architecture

```
User Question
     ↓
OpenAI Embedding (text-embedding-ada-002)
     ↓
Qdrant Vector Search (top-k retrieval)
     ↓
Neon Metadata Lookup (chapter/section info)
     ↓
OpenAI GPT-4o-mini (answer generation)
     ↓
Response + Sources
```

## Cost Estimates (Free Tier)

- **Qdrant Cloud**: 1GB free (≈300k vectors)
- **Neon PostgreSQL**: 0.5GB free
- **OpenAI**: Pay-per-use
  - Embeddings: $0.0001 per 1k tokens
  - GPT-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens
  - Estimated: $0.01-0.05 per query

## Troubleshooting

### "Qdrant connection failed"
- Check `QDRANT_URL` format: `https://your-cluster.qdrant.io` (no port)
- Verify API key is correct
- Ensure cluster is active

### "Database connection failed"
- Verify connection string includes `?sslmode=require`
- Check database exists
- Run schema.sql to create tables

### "OpenAI API error"
- Verify API key is valid
- Check account has credits
- Ensure rate limits not exceeded

### "No results found"
- Run ingestion pipeline: `python -m app.ingest_textbook`
- Check Qdrant collection exists
- Verify chunks in database

## Development

Run tests:
```bash
pytest
```

Check code style:
```bash
black app/
flake8 app/
```

## License

MIT
