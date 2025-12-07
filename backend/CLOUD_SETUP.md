# Cloud Services Setup Guide

This guide walks you through setting up Qdrant Community Cloud and Neon PostgreSQL for the Physical AI textbook RAG system.

## 1. Qdrant Community Cloud Setup (T011)

### Create Account
1. Visit [https://cloud.qdrant.io/](https://cloud.qdrant.io/)
2. Sign up for a free account (GitHub/Google SSO recommended)
3. Verify your email

### Create Collection
1. Click **"Create Cluster"** → Select **"Free Tier"**
2. Choose region closest to your users (e.g., `us-east-1`)
3. Create a collection with these settings:
   - **Collection Name**: `textbook_chunks`
   - **Vector Size**: `384` (for all-MiniLM-L6-v2)
   - **Distance Metric**: `Cosine`
   - **On-disk payload**: Enabled (for free tier optimization)

### Get Credentials
1. Go to **"API Keys"** → **"Generate new API key"**
2. Copy the following:
   - **Cluster URL**: `https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.us-east-1-0.aws.cloud.qdrant.io:6333`
   - **API Key**: `your-api-key-here`

### Update `.env`
```bash
cd backend
cp .env.example .env
# Edit .env and set:
QDRANT_URL=https://your-cluster-url.qdrant.io:6333
QDRANT_API_KEY=your_api_key_here
```

---

## 2. Neon PostgreSQL Setup (T012)

### Create Account
1. Visit [https://neon.tech/](https://neon.tech/)
2. Sign up for free account (GitHub SSO recommended)
3. Verify your email

### Create Database
1. Click **"Create Project"**
2. Project settings:
   - **Project Name**: `physical-ai-textbook`
   - **Region**: Same as Qdrant (e.g., `US East (Ohio)`)
   - **Postgres Version**: `16` (latest)
   - **Compute Size**: `0.25 vCPU, 1 GB RAM` (free tier)

### Get Connection String
1. Go to **"Dashboard"** → **"Connection Details"**
2. Copy the **Connection String** (format: `postgresql://user:password@host/dbname`)
   - Example: `postgresql://user:abc123@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb`

### Update `.env`
```bash
# In backend/.env, set:
DATABASE_URL=postgresql://your-connection-string-here
```

---

## 3. Verify Setup

After completing both setups, your `backend/.env` should look like:

```env
# Qdrant Configuration
QDRANT_URL=https://abc123.us-east-1-0.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key

# Neon PostgreSQL Configuration
DATABASE_URL=postgresql://user:pass@ep-name.us-east-2.aws.neon.tech/neondb

# Embedding Model Configuration
TRANSFORMERS_CACHE=./models_cache
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2

# API Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourusername.github.io
RATE_LIMIT_PER_MINUTE=10

# Logging
LOG_LEVEL=INFO
```

## 4. Free Tier Limits

### Qdrant Free Tier
- **Storage**: 1 GB
- **Vectors**: ~2.6M vectors (384-dim)
- **Request Rate**: Unlimited
- **Clusters**: 1 free cluster

**Our Usage** (6 chapters, ~300 chunks):
- Vectors: 300 × 384 × 4 bytes ≈ **460 KB** ✅
- Metadata: ~100 KB ✅
- **Total**: ~560 KB (well under 1 GB limit)

### Neon Free Tier
- **Storage**: 0.5 GB
- **Compute**: 100 hours/month (auto-suspend after 5 min idle)
- **Databases**: 10 per account
- **Branches**: 10 per project

**Our Usage** (chunk metadata table):
- Rows: ~300 chunks
- Size per row: ~500 bytes (UUIDs, integers, text)
- **Total**: ~150 KB ✅

---

## Next Steps

Once you've completed the setup and updated `.env`:

1. Run database initialization:
   ```bash
   cd backend
   python scripts/setup_db.py
   ```

2. Test backend startup:
   ```bash
   uvicorn app.main:app --reload
   ```

3. Visit health check:
   ```
   http://localhost:8000/health
   ```

---

**Note**: Both services offer generous free tiers. If you exceed limits during development, you can:
- **Qdrant**: Delete old collections or upgrade to paid tier ($25/month)
- **Neon**: Delete unused branches or upgrade to pro tier ($19/month)
