# Environment Variables Reference

Complete reference for all environment variables used in the Physical AI textbook project.

## Overview

This project uses environment variables for:
- Database connections (Qdrant, PostgreSQL)
- API configuration (CORS, rate limiting)
- Model settings (embedding model)
- Deployment settings

---

## Backend Environment Variables

### Required Variables

These **MUST** be set for the application to run:

#### `QDRANT_URL`
- **Description**: URL of your Qdrant vector database cluster
- **Format**: `https://your-cluster.qdrant.io:6333`
- **Where to get it**: Qdrant Cloud dashboard after creating a cluster
- **Example**: `https://abc123.qdrant.io:6333`
- **Notes**:
  - Must include port `:6333`
  - Must use HTTPS in production
  - Free tier provides 1GB storage

#### `QDRANT_API_KEY`
- **Description**: API key for authenticating to Qdrant
- **Format**: Alphanumeric string (typically 64 characters)
- **Where to get it**: Qdrant Cloud dashboard > API Keys
- **Example**: `AbC123xyz...` (64 characters)
- **Security**:
  - Never commit to Git
  - Rotate every 90 days
  - Keep in secrets manager

#### `DATABASE_URL`
- **Description**: PostgreSQL connection string for Neon
- **Format**: `postgresql://user:password@host:5432/database?sslmode=require`
- **Where to get it**: Neon dashboard > Connection Details
- **Example**: `postgresql://user:Abc123@ep-cool-forest-123.us-east-2.aws.neon.tech:5432/textbook_db?sslmode=require`
- **Notes**:
  - Must include `?sslmode=require` for SSL
  - Free tier: 0.5GB storage, 100 compute hours/month
  - Connection pooling enabled by default

---

### Optional Variables (Recommended for Production)

#### `ALLOWED_ORIGINS`
- **Description**: Comma-separated list of URLs allowed to access the API (CORS)
- **Format**: `https://domain1.com,https://domain2.com`
- **Default**: `http://localhost:3000`
- **Production Example**: `https://yourusername.github.io,https://custom-domain.com`
- **Notes**:
  - No trailing slashes
  - Include both GitHub Pages and custom domains
  - Wildcard `*` not recommended for security

#### `RATE_LIMIT_PER_MINUTE`
- **Description**: Maximum API requests per IP address per minute
- **Format**: Integer
- **Default**: `10`
- **Recommended**: `10` (free tier), `50` (paid tier)
- **Notes**:
  - Prevents API abuse
  - Returns 429 status when exceeded
  - Resets every 60 seconds

#### `LOG_LEVEL`
- **Description**: Application logging verbosity
- **Format**: String (uppercase)
- **Options**: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`
- **Default**: `INFO`
- **Development**: `DEBUG`
- **Production**: `INFO` or `WARNING`
- **Notes**:
  - `DEBUG`: Very verbose, includes SQL queries
  - `INFO`: Standard logs, startup/shutdown messages
  - `WARNING`: Only warnings and errors

---

### Optional Variables (Use Defaults if Not Set)

#### `TRANSFORMERS_CACHE`
- **Description**: Directory to cache downloaded embedding models
- **Format**: File path
- **Default**: `./models_cache`
- **Railway/Render**: `/tmp/models_cache` (ephemeral storage)
- **Local**: `./models_cache`
- **Notes**:
  - Model is ~80MB
  - First startup downloads model (2-3 min)
  - Subsequent starts use cache (fast)

#### `MODEL_NAME`
- **Description**: Hugging Face model identifier for embeddings
- **Format**: `organization/model-name`
- **Default**: `sentence-transformers/all-MiniLM-L6-v2`
- **Alternatives**:
  - `sentence-transformers/all-mpnet-base-v2` (higher quality, slower)
  - `sentence-transformers/paraphrase-MiniLM-L6-v2` (similar performance)
- **Notes**:
  - All-MiniLM-L6-v2 specs:
    - Embedding dimension: 384
    - Model size: ~80MB
    - Inference speed: ~10ms per query
    - Best for: General semantic search

---

## Frontend Environment Variables

### `DOCUSAURUS_API_URL`

- **Description**: Backend API URL for chatbot queries
- **Format**: Full URL with protocol (no trailing slash)
- **Development**: `http://localhost:8000`
- **Production**: `https://your-app.railway.app` or `https://your-app.onrender.com`
- **Notes**:
  - Set in `.env` file for local development
  - Set as GitHub Actions secret for deployment
  - Must match backend's `ALLOWED_ORIGINS`

---

## Setting Environment Variables

### Local Development

**Backend (.env file):**

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
QDRANT_URL=https://your-cluster.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key_here
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/textbook_db?sslmode=require
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=DEBUG
```

**Frontend (.env file):**

```bash
cd website
cp .env.example .env
```

Edit `.env`:
```env
DOCUSAURUS_API_URL=http://localhost:8000
```

### Railway Deployment

**Via CLI:**

```bash
railway variables set QDRANT_URL="https://your-cluster.qdrant.io:6333"
railway variables set QDRANT_API_KEY="your_key"
railway variables set DATABASE_URL="postgresql://..."
railway variables set ALLOWED_ORIGINS="https://yourusername.github.io"
railway variables set RATE_LIMIT_PER_MINUTE="10"
railway variables set LOG_LEVEL="INFO"
railway variables set TRANSFORMERS_CACHE="/tmp/models_cache"
```

**Via Dashboard:**

1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add each variable name and value

### Render Deployment

**Via Dashboard:**

1. Go to your Render web service
2. Click "Environment" in the left sidebar
3. Click "Add Environment Variable"
4. Add each variable:
   - Key: `QDRANT_URL`
   - Value: `https://your-cluster.qdrant.io:6333`
5. Click "Save Changes"

### GitHub Actions (Frontend Deployment)

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add:
   - Name: `BACKEND_API_URL`
   - Value: `https://your-app.railway.app`

---

## Validation

### Verify Backend Variables

```bash
cd backend

# Test database connections
python -c "
from app.config import settings
print(f'Qdrant URL: {settings.qdrant_url}')
print(f'Database URL: {settings.database_url[:30]}...')
print(f'CORS Origins: {settings.cors_origins}')
print(f'Rate Limit: {settings.rate_limit_per_minute}/min')
print(f'Log Level: {settings.log_level}')
"
```

Expected output:
```
Qdrant URL: https://abc123.qdrant.io:6333
Database URL: postgresql://user:password@ep...
CORS Origins: ['https://yourusername.github.io', 'http://localhost:3000']
Rate Limit: 10/min
Log Level: INFO
```

### Test Health Endpoint

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "qdrant": "connected",
    "postgres": "connected",
    "embeddings": "loaded"
  }
}
```

---

## Security Best Practices

### ✅ DO:

- Store secrets in environment variables (not code)
- Use `.env` files for local development
- Add `.env` to `.gitignore`
- Use platform secret managers (Railway, Render, GitHub Actions)
- Rotate API keys regularly (every 90 days)
- Use strong, unique values for production
- Validate environment variables on startup (Pydantic does this automatically)

### ❌ DON'T:

- Commit `.env` files to Git
- Hard-code secrets in source code
- Use same values for dev and production
- Share secrets via email or chat
- Use weak or default values
- Expose secrets in error messages
- Log sensitive values

---

## Troubleshooting

### "Field required" Error

**Error:**
```
ValidationError: 3 validation errors for Settings
qdrant_url
  Field required [type=missing]
```

**Solution:**
- All required variables must be set
- Check spelling (case-insensitive)
- Verify `.env` file is in correct directory
- For Railway/Render, check dashboard variables

### Qdrant Connection Failed

**Error:**
```
QdrantException: Failed to connect to Qdrant
```

**Solution:**
- Verify `QDRANT_URL` includes port `:6333`
- Check API key is correct (no extra spaces)
- Ensure cluster is active (not paused)
- Test connection:
  ```bash
  curl -X GET https://your-cluster.qdrant.io:6333/collections \
    -H "api-key: your_key"
  ```

### Database Connection Failed

**Error:**
```
psycopg2.OperationalError: could not connect to server
```

**Solution:**
- Verify `DATABASE_URL` format
- Ensure `?sslmode=require` is appended
- Check username and password are correct
- Verify database name exists
- Test connection:
  ```bash
  psql "postgresql://user:pass@host:5432/db?sslmode=require"
  ```

### CORS Errors in Browser

**Error:**
```
Access to fetch at 'https://api.com/query' from origin 'https://site.com' has been blocked by CORS
```

**Solution:**
- Add frontend URL to `ALLOWED_ORIGINS`
- Format: exact match, no trailing slash
- Multiple origins: comma-separated
- Restart backend after changing variable

---

## Environment Variables Checklist

Before deploying to production, verify:

### Backend:
- [ ] `QDRANT_URL` set and tested
- [ ] `QDRANT_API_KEY` set and tested
- [ ] `DATABASE_URL` set and tested
- [ ] `ALLOWED_ORIGINS` includes production frontend URL
- [ ] `RATE_LIMIT_PER_MINUTE` set to `10`
- [ ] `LOG_LEVEL` set to `INFO`
- [ ] `TRANSFORMERS_CACHE` set to `/tmp/models_cache` (ephemeral hosting)

### Frontend:
- [ ] `DOCUSAURUS_API_URL` set in GitHub Actions secrets
- [ ] Value matches backend deployment URL
- [ ] Backend CORS allows frontend origin

### Security:
- [ ] `.env` files in `.gitignore`
- [ ] No secrets in Git history
- [ ] Production values different from development
- [ ] API keys rotated and documented

---

## Quick Reference Table

| Variable | Required | Default | Where to Set |
|----------|----------|---------|-------------|
| `QDRANT_URL` | ✅ Yes | None | Qdrant Cloud |
| `QDRANT_API_KEY` | ✅ Yes | None | Qdrant Cloud |
| `DATABASE_URL` | ✅ Yes | None | Neon PostgreSQL |
| `ALLOWED_ORIGINS` | ⚠️ Recommended | `http://localhost:3000` | Manual |
| `RATE_LIMIT_PER_MINUTE` | ⚠️ Recommended | `10` | Manual |
| `LOG_LEVEL` | 🔧 Optional | `INFO` | Manual |
| `TRANSFORMERS_CACHE` | 🔧 Optional | `./models_cache` | Manual |
| `MODEL_NAME` | 🔧 Optional | `sentence-transformers/all-MiniLM-L6-v2` | Manual |
| `DOCUSAURUS_API_URL` | ✅ Yes (Frontend) | None | GitHub Actions |

---

**Last Updated:** 2025-12-02
**Version:** 1.0.0
