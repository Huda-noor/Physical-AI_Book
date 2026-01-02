# Quick Start Guide - RAG Chatbot Phase 2

Get the RAG chatbot running in 15 minutes.

## Prerequisites

- OpenAI API key (get from https://platform.openai.com)
- Qdrant Cloud account (free at https://cloud.qdrant.io)
- Neon PostgreSQL account (free at https://neon.tech)

## 1. Get API Keys (5 minutes)

### OpenAI
```
1. Visit: https://platform.openai.com/api-keys
2. Click: Create new secret key
3. Copy: sk-proj-xxxxx
4. Add $5-10 credits to account
```

### Qdrant Cloud
```
1. Visit: https://cloud.qdrant.io
2. Create free cluster (1GB)
3. Copy cluster URL: https://xxx.qdrant.io
4. Copy API key from dashboard
```

### Neon PostgreSQL
```
1. Visit: https://neon.tech
2. Create free project
3. Copy connection string from dashboard
4. Should look like: postgresql://user:pass@host/db?sslmode=require
```

## 2. Set Up Database (2 minutes)

In Neon SQL Editor, run:
```sql
-- From backend/schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    UNIQUE(chapter_id, section_id, chunk_index)
);

CREATE INDEX idx_chapter_id ON chunk_metadata(chapter_id);
CREATE INDEX idx_section_id ON chunk_metadata(section_id);
```

## 3. Configure Backend (1 minute)

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=sk-proj-xxxxx
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-key
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
EMBEDDING_MODEL=text-embedding-ada-002
LLM_MODEL=gpt-4o-mini
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 4. Install and Run (5 minutes)

### Backend
```bash
cd backend
pip install -r requirements.txt

# Ingest textbook content (one-time, ~5 min)
python -m app.ingest_textbook

# Start API server
python -m app.main
# API running at http://localhost:8000
```

### Frontend
```bash
cd website
npm install

# Add API URL to .env (create if doesn't exist)
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
# Site running at http://localhost:3000
```

## 5. Test It! (2 minutes)

1. Open http://localhost:3000
2. Click chatbot icon (bottom right corner)
3. Ask: "What is Physical AI?"
4. You should get an answer with sources!

### Test Selected Text Mode
1. Go to any chapter
2. Highlight some text
3. See "Text selected" indicator in chatbot
4. Ask a question about the highlighted text
5. Answer should be based only on your selection

## Verification Checklist

- [ ] Backend health check passes: `curl http://localhost:8000/health`
- [ ] Frontend loads without errors
- [ ] Chatbot icon appears on all pages
- [ ] Full-book questions work
- [ ] Text selection mode works
- [ ] Sources display chapter/section info

## Common Issues

### "Module not found" errors
```bash
pip install -r requirements.txt --force-reinstall
```

### "Qdrant connection failed"
- Verify URL format: `https://xxx.qdrant.io` (no :6333 port)
- Check API key is correct

### "Database connection failed"
- Ensure connection string ends with `?sslmode=require`
- Verify database exists in Neon dashboard

### "No results found"
- Ingestion might have failed
- Check `app.ingest_textbook` logs for errors
- Re-run ingestion

### Chatbot not appearing
- Check browser console for errors
- Verify `REACT_APP_API_URL` is set
- Clear browser cache and reload

## Next Steps

See `DEPLOYMENT.md` for:
- Deploying to Railway (backend)
- Connecting Vercel frontend
- Production configuration
- Monitoring and scaling

## Cost Estimate

**Free Tier Usage:**
- Qdrant: Free (1GB = plenty for 6 chapters)
- Neon: Free (0.5GB = sufficient)
- OpenAI: ~$0.02-0.05 per query
- Expected: $5-10/month for moderate usage

## Architecture

```
User → Frontend (React/Docusaurus)
         ↓
      Backend (FastAPI)
         ↓
    ┌────┴────┐
    ↓         ↓
OpenAI     Qdrant + Neon
(GPT)      (RAG Pipeline)
```

## Support

- Backend issues: Check `http://localhost:8000/health`
- Frontend issues: Check browser console
- Ingestion issues: Check terminal output
- Questions: Create GitHub issue

Enjoy your AI-powered textbook! 🤖📚
