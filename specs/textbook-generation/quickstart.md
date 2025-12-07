# Quickstart Guide: Textbook Generation

**Feature**: textbook-generation
**Date**: 2025-12-01
**Audience**: Developers setting up local development environment

## Prerequisites

- **Node.js**: 18 LTS or higher ([Download](https://nodejs.org/))
- **Python**: 3.11 or higher ([Download](https://www.python.org/downloads/))
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/physical-ai-textbook.git
cd physical-ai-textbook
```

## 2. Environment Setup

### Create Environment Files

**Frontend** (`website/.env`):
```bash
# Backend API URL
DOCUSAURUS_API_URL=http://localhost:8000

# Build configuration
NODE_ENV=development
```

**Backend** (`backend/.env`):
```bash
# Qdrant Configuration
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# Neon PostgreSQL Configuration
DATABASE_URL=postgresql://user:password@your-instance.neon.tech/textbook_db

# Embedding Model Configuration
TRANSFORMERS_CACHE=./models_cache
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2

# API Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourusername.github.io
RATE_LIMIT_PER_MINUTE=10

# Logging
LOG_LEVEL=INFO
```

### Get API Keys

**Qdrant Community Cloud** (Free Tier):
1. Sign up at [https://cloud.qdrant.io/](https://cloud.qdrant.io/)
2. Create new cluster (Community tier, 1GB free)
3. Copy API key and cluster URL to `backend/.env`

**Neon PostgreSQL** (Free Tier):
1. Sign up at [https://neon.tech/](https://neon.tech/)
2. Create new project
3. Copy connection string to `backend/.env` as `DATABASE_URL`

## 3. Backend Setup

### Install Python Dependencies

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Initialize Database

```bash
# Create Neon PostgreSQL schema
python scripts/setup_db.py

# Expected output:
# ✓ Connected to Neon PostgreSQL
# ✓ Created table: chunk_metadata
# ✓ Created table: chat_queries
# ✓ Created table: chat_responses
# ✓ Created indexes
# Database setup complete!
```

### Download Embedding Model

```bash
# Pre-download model to avoid first-request delay
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Expected output:
# Downloading model... (80MB)
# Model saved to ./models_cache/
```

### Initialize Qdrant Collection

```bash
# Create Qdrant collection with correct configuration
python scripts/setup_qdrant.py

# Expected output:
# ✓ Connected to Qdrant Cloud
# ✓ Created collection: textbook_chunks (384 dimensions, cosine distance)
# ✓ Configured HNSW index (m=16, ef_construct=100)
# Qdrant setup complete!
```

### Run Backend Server

```bash
# Start FastAPI server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process
# INFO:     Started server process
# INFO:     Application startup complete

# Verify health endpoint
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","services":{"qdrant":"connected","neon":"connected","embedding_model":"loaded"},"timestamp":"2025-12-01T12:00:00Z"}
```

### View API Documentation

Open browser to [http://localhost:8000/docs](http://localhost:8000/docs) for interactive Swagger UI.

## 4. Frontend Setup

### Install Node Dependencies

```bash
cd ../website

# Install dependencies
npm install

# Expected output:
# added 1523 packages in 45s
```

### Run Development Server

```bash
# Start Docusaurus dev server
npm start

# Expected output:
# [INFO] Starting the development server...
# [SUCCESS] Docusaurus website is running at http://localhost:3000/
```

Open browser to [http://localhost:3000](http://localhost:3000)

### Build Static Site (Optional)

```bash
# Build production bundle
npm run build

# Expected output:
# [SUCCESS] Generated static files in "build" directory
# [INFO] Bundle size: 189 KB (within 200 KB budget)
# [INFO] Build time: 42s (within 3min budget)

# Serve locally
npm run serve
```

## 5. Index Chapter Content

### Create Sample Chapter

**File**: `website/docs/chapter-1-introduction-to-physical-ai.md`

```markdown
---
id: chapter-1
title: Chapter 1 - Introduction to Physical AI
sidebar_label: Introduction to Physical AI
sidebar_position: 1
---

# Chapter 1: Introduction to Physical AI

## Learning Objectives

By the end of this chapter, you will be able to:
- Define Physical AI and explain its key characteristics
- Identify real-world applications of Physical AI systems
- Understand the challenges unique to embodied AI agents

## Introduction

Physical AI represents a paradigm shift in artificial intelligence...

## Core Concepts

### What is Physical AI?

Physical AI refers to artificial intelligence systems that interact with the physical world through embodied agents like robots...

### Key Characteristics

1. **Embodiment**: Physical presence in the real world
2. **Sensor Integration**: Perception through cameras, LIDAR, IMUs
3. **Real-time Constraints**: Sub-second decision-making requirements

## Practical Application

### Example: Warehouse Automation Robot

[Code example here...]

## Summary

- Physical AI combines AI algorithms with robotic hardware
- Challenges include sensor noise, dynamic environments, and safety
- Applications span manufacturing, healthcare, and logistics

## Further Reading

- [Book reference 1]
- [Academic paper 2]
```

### Run Indexing Script

```bash
cd ../backend

# Index all chapters in website/docs/
python scripts/index_chapters.py

# Expected output:
# [INFO] Parsing chapter files...
# [INFO] Found 6 chapters
# [INFO] Chunking chapter 1... (45 chunks, 3421 tokens)
# [INFO] Chunking chapter 2... (52 chunks, 4123 tokens)
# ...
# [INFO] Generating embeddings... (287 chunks in batches of 32)
# [INFO] Batch 1/9 encoded in 2.3s
# ...
# [INFO] Storing vectors in Qdrant... (batch size 100)
# [INFO] Storing metadata in Neon...
# [SUCCESS] Indexing complete!
# [REPORT]
# {
#   "status": "success",
#   "chapters_processed": 6,
#   "total_chunks": 287,
#   "total_tokens": 98543,
#   "duration_seconds": 23.4,
#   "qdrant_storage_mb": 42.3
# }
```

## 6. Test RAG Pipeline

### Query via API

```bash
# Test query endpoint
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is Physical AI?",
    "max_results": 5
  }'

# Expected response:
# {
#   "answer": "Physical AI refers to artificial intelligence systems that interact with the physical world through embodied agents like robots...",
#   "sources": [
#     {"chapter": "1", "section": "What is Physical AI?", "page": 3, "confidence": 0.92, "chunk_id": "..."}
#   ],
#   "confidence": 0.89,
#   "response_time_ms": 1243
# }
```

### Test via Frontend

1. Open [http://localhost:3000/chapter-1-introduction-to-physical-ai](http://localhost:3000/chapter-1-introduction-to-physical-ai)
2. Click chatbot icon (bottom-right corner)
3. Type "What is Physical AI?" and press Enter
4. Verify response appears with source citations
5. Click source link to navigate to chapter section

## 7. Run Tests

### Backend Tests

```bash
cd backend

# Run all tests with coverage
pytest tests/ --cov=app --cov-report=term --cov-report=html

# Expected output:
# tests/test_api.py ................... [56%]
# tests/test_rag_service.py ........... [82%]
# tests/test_chunking.py .............. [100%]
# ===================== 42 passed in 8.23s ======================
# Coverage: 84% (target: >80%)

# Run specific test file
pytest tests/test_rag_service.py -v

# Run with debug output
pytest tests/ -s --log-cli-level=DEBUG
```

### Frontend Tests

```bash
cd ../website

# Run Jest tests
npm test

# Expected output:
# PASS  src/components/ChatbotModal.test.tsx
# PASS  src/hooks/useChatbot.test.ts
# Test Suites: 8 passed, 8 total
# Tests:       34 passed, 34 total
# Coverage: 76% (target: >70%)

# Run in watch mode (re-run on file changes)
npm test -- --watch
```

## 8. Common Issues & Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'sentence_transformers'"

**Solution**: Activate virtual environment and reinstall dependencies
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Issue: "Qdrant connection timeout"

**Solution**: Verify API key and URL in `backend/.env`
```bash
# Test connection
curl -H "api-key: YOUR_KEY" https://your-cluster.qdrant.io/collections

# Check firewall/proxy settings if timeout persists
```

### Issue: "Neon database connection refused"

**Solution**: Check DATABASE_URL format and network access
```bash
# Correct format:
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/database_name?sslmode=require

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

### Issue: "Rate limit exceeded immediately"

**Solution**: Clear rate limiter state (in-memory, restart server)
```bash
# Stop FastAPI server (Ctrl+C)
# Restart server
uvicorn app.main:app --reload
```

### Issue: "Docusaurus build fails with TypeScript errors"

**Solution**: Check TypeScript configuration and component props
```bash
# Run type check
npm run type-check

# Fix errors in src/ files
# Re-run build
npm run build
```

### Issue: "Embedding model download slow/fails"

**Solution**: Use mirror or manual download
```bash
# Set HuggingFace mirror (if in region with slow access)
export HF_ENDPOINT=https://hf-mirror.com

# Or download manually and place in ./models_cache/
```

## 9. Development Workflow

### Making Content Changes

1. Edit markdown file in `website/docs/chapter-*.md`
2. Save file (Docusaurus auto-reloads)
3. Verify changes at http://localhost:3000
4. Re-index content:
   ```bash
   cd backend
   python scripts/index_chapters.py --incremental  # Only re-index changed files
   ```
5. Test chatbot with questions about updated content

### Adding New Features

1. Read feature spec in `specs/textbook-generation/spec.md`
2. Create feature branch: `git checkout -b feature/your-feature`
3. Implement changes (frontend in `website/src/`, backend in `backend/app/`)
4. Write tests (frontend in `*.test.tsx`, backend in `tests/test_*.py`)
5. Run tests: `npm test` and `pytest tests/`
6. Commit changes: `git commit -m "feat: your feature description"`
7. Push and create PR: `git push origin feature/your-feature`

### Debugging Tips

**Backend**:
- Add `import pdb; pdb.set_trace()` for breakpoints
- Check logs: `tail -f backend/logs/app.log`
- Use FastAPI `/docs` endpoint to test API manually

**Frontend**:
- Use React DevTools browser extension
- Check browser console for errors (F12)
- Use `console.log()` in components (remove before commit)

## 10. Next Steps

- **Implement P1 (MVP)**: Complete all 6 chapter markdown files
- **Test Thoroughly**: Run `pytest` and `npm test`, verify >80% coverage
- **Deploy**: Follow deployment guide in `README.md`
- **Monitor**: Set up UptimeRobot for `/api/health` endpoint
- **Iterate**: Use user feedback to improve content and chatbot accuracy

## Additional Resources

- **Docusaurus Docs**: https://docusaurus.io/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Qdrant Docs**: https://qdrant.tech/documentation/
- **sentence-transformers**: https://www.sbert.net/
- **Project Spec**: `specs/textbook-generation/spec.md`
- **Data Model**: `specs/textbook-generation/data-model.md`
- **API Contracts**: `specs/textbook-generation/contracts/openapi.yaml`

---

**Feedback**: If you encounter issues not covered here, please open an issue on GitHub or contact the maintainers.
