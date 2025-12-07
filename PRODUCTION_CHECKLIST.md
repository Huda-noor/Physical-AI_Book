# Production Launch Checklist

Complete checklist for deploying Physical AI & Humanoid Robotics textbook to production.

## Pre-Deployment Checks

### ✅ Development Environment

- [ ] Local development server runs without errors (`npm start`)
- [ ] Local backend server runs without errors (`python simple_server.py`)
- [ ] All 6 chapters render correctly
- [ ] Chatbot UI opens and displays messages
- [ ] No console errors in browser DevTools
- [ ] Dark mode toggle works
- [ ] Mobile responsive design tested (iPhone, Android)

### ✅ Code Quality

- [ ] TypeScript compilation successful (`npm run typecheck`)
- [ ] Production build completes (`npm run build`)
- [ ] No broken links (`onBrokenLinks: 'throw'` in config)
- [ ] All images optimized and load correctly
- [ ] Code follows project conventions

### ✅ Content Validation

- [ ] All 6 chapters have content
- [ ] Frontmatter correct (id, title, sidebar_label)
- [ ] Learning objectives defined
- [ ] Code examples tested
- [ ] External links work
- [ ] Images have alt text
- [ ] Tables render correctly

---

## Cloud Services Setup

### 1. Qdrant Cloud

- [ ] Account created at https://cloud.qdrant.io
- [ ] Free cluster created
- [ ] Cluster URL noted (format: `https://xyz.qdrant.io:6333`)
- [ ] API key generated and saved securely
- [ ] Collection will be created by indexing script (no manual setup needed)

**Expected Capacity:**
- Free tier: 1GB storage
- Estimated chapters: ~30,000 chunks (384-dim)
- Current usage: ~1,500 chunks (6 chapters = ~5% usage)

### 2. Neon PostgreSQL

- [ ] Account created at https://neon.tech
- [ ] Project created: `physical-ai-textbook`
- [ ] Database created: `textbook_db`
- [ ] Connection string copied
- [ ] Connection string format verified: `postgresql://user:pass@host:5432/textbook_db?sslmode=require`

**Expected Capacity:**
- Free tier: 0.5GB storage, 100 hours compute/month
- Current usage: ~10MB, <1 hour/month

### 3. Backend Hosting (Railway OR Render)

#### Option A: Railway
- [ ] Account created at https://railway.app
- [ ] GitHub repository connected
- [ ] Project created
- [ ] Root directory set to `backend`
- [ ] Environment variables configured (see below)
- [ ] Custom domain assigned (optional)

#### Option B: Render
- [ ] Account created at https://render.com
- [ ] Web service created
- [ ] GitHub repository connected
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Environment variables configured (see below)

**Expected Capacity:**
- Railway free: 500 hours/month
- Render free: 750 hours/month
- Note: Both sleep after 15min inactivity

### 4. Frontend Hosting (GitHub Pages)

- [ ] Repository pushed to GitHub
- [ ] GitHub Pages enabled (Settings > Pages)
- [ ] Source set to "GitHub Actions"
- [ ] Workflow file created: `.github/workflows/deploy-frontend.yml`
- [ ] Repository secrets configured

---

## Environment Variables Configuration

### Backend Environment Variables

**Required (Must Set):**

```env
# Qdrant Configuration
QDRANT_URL=https://your-cluster.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key_here

# Neon PostgreSQL Configuration
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/textbook_db?sslmode=require
```

**Recommended (Set for Production):**

```env
# API Configuration
ALLOWED_ORIGINS=https://yourusername.github.io,https://your-custom-domain.com
RATE_LIMIT_PER_MINUTE=10

# Logging
LOG_LEVEL=INFO
```

**Optional (Use Defaults if Not Set):**

```env
# Embedding Model Configuration
TRANSFORMERS_CACHE=/tmp/models_cache
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
```

### Frontend Environment Variables

**GitHub Actions Secrets:**

- [ ] `BACKEND_API_URL` - Your Railway/Render backend URL
  - Example: `https://your-app.railway.app`
  - Example: `https://your-app.onrender.com`

---

## Database Initialization

### Step 1: Local Testing

Before deploying, test database setup locally:

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Set environment variables
export QDRANT_URL="your-url"
export QDRANT_API_KEY="your-key"
export DATABASE_URL="your-connection-string"

# Initialize database
python scripts/setup_db.py
```

**Expected Output:**
```
✅ PostgreSQL connection successful
✅ Table 'chapter_metadata' created
📊 Schema validated
```

- [ ] Setup script runs without errors
- [ ] Table created in Neon dashboard

### Step 2: Index Chapters

```bash
python scripts/index_chapters.py
```

**Expected Output:**
```
📚 Physical AI Textbook Indexing
✅ Embedding model loaded (384 dimensions)
✅ Qdrant collection ready: textbook_chunks

Processing chapters...
📖 Chapter 1: 15 chunks indexed
📖 Chapter 2: 18 chunks indexed
📖 Chapter 3: 22 chunks indexed
📖 Chapter 4: 14 chunks indexed
📖 Chapter 5: 20 chunks indexed
📖 Chapter 6: 16 chunks indexed

✨ Indexing Complete!
   Total chunks: 105
   Avg chunks/chapter: 17.5
   Total embedding time: 12.3s
```

**Verification:**
- [ ] All 6 chapters indexed
- [ ] Total chunks: 90-150 (expected range)
- [ ] Qdrant dashboard shows collection with points
- [ ] Neon dashboard shows rows in `chapter_metadata`

---

## Deployment Steps

### Phase 1: Deploy Backend

1. **Railway Deployment:**

```bash
cd backend

# Login to Railway CLI
railway login

# Link to project
railway link

# Set environment variables
railway variables set QDRANT_URL="..."
railway variables set QDRANT_API_KEY="..."
railway variables set DATABASE_URL="..."
railway variables set ALLOWED_ORIGINS="https://yourusername.github.io"

# Deploy
railway up
```

- [ ] Deployment successful
- [ ] Public URL assigned
- [ ] Health endpoint accessible: `https://your-app.railway.app/health`

**Health Check Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T...",
  "version": "1.0.0",
  "services": {
    "qdrant": "connected",
    "postgres": "connected",
    "embeddings": "loaded"
  }
}
```

2. **Test Backend API:**

```bash
curl -X POST https://your-app.railway.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Physical AI?", "top_k": 5}'
```

- [ ] Query returns answer
- [ ] Sources include chapter citations
- [ ] Response time < 3 seconds

### Phase 2: Deploy Frontend

1. **Update Configuration:**

Edit `website/docusaurus.config.ts`:

```typescript
url: 'https://yourusername.github.io',
baseUrl: '/my-book/',
organizationName: 'yourusername',
projectName: 'my-book',
```

- [ ] URL updated
- [ ] baseUrl matches repository name
- [ ] Organization name correct

2. **Set GitHub Secret:**

- Go to: Repository > Settings > Secrets and variables > Actions
- [ ] Add `BACKEND_API_URL` with your Railway/Render URL

3. **Push to GitHub:**

```bash
git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

- [ ] Code pushed to `main` branch
- [ ] GitHub Actions workflow triggered
- [ ] Build successful (check Actions tab)
- [ ] Site deployed to GitHub Pages

4. **Verify Deployment:**

- [ ] Site accessible at: `https://yourusername.github.io/my-book/`
- [ ] All pages load correctly
- [ ] CSS and images display
- [ ] Navigation works

---

## Post-Deployment Validation

### Frontend Checks

**Homepage:**
- [ ] Gradient hero section displays
- [ ] All 6 chapter cards visible
- [ ] "Get Started" button works
- [ ] Cards animate on load

**Navigation:**
- [ ] Sidebar shows all chapters
- [ ] Chapter pages load
- [ ] Prev/Next buttons work
- [ ] Search functionality works

**Chatbot:**
- [ ] Chatbot icon appears (bottom-right)
- [ ] Modal opens on click
- [ ] Welcome message displays
- [ ] Input field accepts text

**Performance:**
- [ ] Lighthouse score > 90 (Performance)
- [ ] Page load < 2 seconds
- [ ] No console errors
- [ ] Mobile responsive

### Backend Checks

**Health Endpoint:**
- [ ] `/health` returns 200 OK
- [ ] All services show "connected"
- [ ] Embedding model shows "loaded"

**Query Endpoint:**
- [ ] `/api/query` returns relevant answers
- [ ] Sources include chapter citations
- [ ] Response time p95 < 2s
- [ ] Rate limiting works (429 after 10 req/min)

**CORS:**
- [ ] Frontend can call backend
- [ ] No CORS errors in browser console

### Integration Tests

**End-to-End Chatbot Test:**

1. Open deployed site
2. Click chatbot icon
3. Ask: "What is Physical AI?"
4. **Verify:**
   - [ ] Answer appears within 3 seconds
   - [ ] Answer is relevant and accurate
   - [ ] Sources display with chapter links
   - [ ] Links navigate to correct chapters
   - [ ] No errors in console

**Multiple Query Test:**

1. Ask 3 different questions:
   - "What is Physical AI?"
   - "How does ROS 2 work?"
   - "Explain VLA systems"
2. **Verify:**
   - [ ] All answers relevant
   - [ ] Sources vary by question
   - [ ] No performance degradation

---

## Performance Benchmarks

### Frontend Metrics

**Lighthouse Audit (Desktop):**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Bundle Size:**
- Initial JS: < 200KB
- Total assets: < 1MB
- Fonts: < 50KB

- [ ] All metrics within targets

### Backend Metrics

**API Response Times:**
- Health check: < 100ms
- Query endpoint p50: < 1s
- Query endpoint p95: < 2s
- Query endpoint p99: < 3s

**Resource Usage:**
- Memory: < 300MB
- Startup time: < 30s (first boot)
- Startup time: < 5s (restarts)

- [ ] All metrics within targets

---

## Security Checklist

### Backend Security

- [ ] HTTPS enforced (Railway/Render provides automatically)
- [ ] CORS configured with specific origins (not `*`)
- [ ] Rate limiting enabled (10 req/min per IP)
- [ ] Environment variables stored securely (not in code)
- [ ] API keys rotated (recommended: every 90 days)
- [ ] Input validation with Pydantic models
- [ ] SQL injection prevention (parameterized queries)
- [ ] Error messages don't leak sensitive info

### Frontend Security

- [ ] HTTPS enforced on GitHub Pages
- [ ] No secrets in client-side code
- [ ] Content Security Policy headers set
- [ ] XSS prevention (React escapes by default)
- [ ] External links use `rel="noopener noreferrer"`
- [ ] No inline scripts

### Infrastructure Security

- [ ] GitHub repository: private or public?
  - If public: ensure no secrets in history
- [ ] Qdrant API key kept secure
- [ ] Neon connection string kept secure
- [ ] Railway/Render variables encrypted
- [ ] GitHub Actions secrets configured

---

## Monitoring Setup

### Backend Monitoring

**Health Checks:**
- [ ] Set up UptimeRobot or similar
  - URL: `https://your-app.railway.app/health`
  - Interval: 5 minutes
  - Alert on: 3 consecutive failures

**Logs:**
- [ ] Railway/Render dashboard configured
- [ ] Log retention: 7 days minimum
- [ ] Error alerts configured

**Metrics (Optional):**
- [ ] Sentry for error tracking
- [ ] LogTail for log aggregation
- [ ] Datadog for APM

### Frontend Monitoring

**Analytics:**
- [ ] Google Analytics configured (optional)
- [ ] Plausible Analytics configured (privacy-friendly alternative)

**Error Tracking:**
- [ ] Sentry configured for React errors

**User Feedback:**
- [ ] Feedback form or email link provided

---

## Rollback Plan

### If Frontend Deployment Fails

1. Check GitHub Actions logs for errors
2. Revert to previous commit:
   ```bash
   git revert HEAD
   git push origin main
   ```
3. Fix issues locally
4. Redeploy

### If Backend Deployment Fails

1. Check Railway/Render logs
2. Roll back to previous deployment in dashboard
3. Fix environment variables or code
4. Redeploy

### Database Issues

1. **If indexing fails:**
   - Delete Qdrant collection
   - Truncate PostgreSQL table
   - Re-run indexing script

2. **If data corrupted:**
   - Restore from backup (if configured)
   - Re-index from source markdown files

---

## Go-Live Checklist

### Final Pre-Launch Checks

- [ ] All environment variables set correctly
- [ ] Database fully indexed (all 6 chapters)
- [ ] Frontend deployed and accessible
- [ ] Backend deployed and healthy
- [ ] Chatbot working end-to-end
- [ ] Performance benchmarks met
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Documentation complete

### Launch Tasks

- [ ] Share URL with stakeholders
- [ ] Announce on social media (optional)
- [ ] Submit to relevant directories (optional)
- [ ] Create demo video (optional)

### Post-Launch (First 24 Hours)

- [ ] Monitor logs for errors
- [ ] Check health endpoint hourly
- [ ] Test chatbot functionality
- [ ] Monitor uptime
- [ ] Gather initial user feedback

### Post-Launch (First Week)

- [ ] Review performance metrics
- [ ] Check database usage (Qdrant, Neon)
- [ ] Monitor free tier limits
- [ ] Address user feedback
- [ ] Plan improvements

---

## Success Criteria

**Technical:**
- ✅ Uptime > 99.5%
- ✅ Average response time < 1s
- ✅ Zero data loss
- ✅ Zero security incidents

**User Experience:**
- ✅ Chatbot answers accurately
- ✅ Site loads quickly
- ✅ Mobile experience smooth
- ✅ Positive user feedback

**Business:**
- ✅ Stays within free tier limits
- ✅ Zero unexpected costs
- ✅ Minimal maintenance required

---

## Next Steps After Launch

1. **Collect Analytics**
   - Track page views
   - Monitor chatbot usage
   - Measure user engagement

2. **Iterate Based on Feedback**
   - Add frequently asked questions to content
   - Improve chatbot responses
   - Enhance UI/UX

3. **Scale if Needed**
   - Upgrade to paid tiers if approaching limits
   - Add caching layer for performance
   - Implement CDN for global users

4. **Add Features**
   - Text selection query feature
   - Chapter personalization
   - Urdu translation
   - Download PDF option

---

## Support and Resources

**Documentation:**
- Full deployment guide: `DEPLOYMENT.md`
- Architecture details: `specs/textbook-generation/plan.md`
- API contracts: `specs/textbook-generation/contracts/`

**Community:**
- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Email: support@example.com

**External Resources:**
- Docusaurus: https://docusaurus.io/docs
- FastAPI: https://fastapi.tiangolo.com
- Qdrant: https://qdrant.tech/documentation
- Neon: https://neon.tech/docs

---

**🎉 Congratulations! Your Physical AI textbook is production-ready!**

**Last Updated:** 2025-12-02
**Version:** 1.0.0
**Status:** ✅ Production Ready
