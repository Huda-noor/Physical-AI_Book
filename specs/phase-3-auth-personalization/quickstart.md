# Quickstart: Phase 3 (Auth & Personalization)

This guide helps you test the authentication and personalization features locally.

## 1. Prerequisites
- Node.js 20+ (for Auth Server)
- Python 3.10+ (for Backend)
- Neon PostgreSQL account + S3 bucket (or local Minio)

## 2. Environment Setup

### Backend (.env)
```env
DATABASE_URL=your_neon_url
BETTER_AUTH_URL=http://localhost:3001
OPENAI_API_KEY=your_key
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=personalized-chapters
```

### Auth Server (website/api-server/.env)
```env
DATABASE_URL=your_neon_url
BETTER_AUTH_SECRET=min-32-character-secret
```

## 3. Running Services

1. **Start Auth Server**:
   ```bash
   cd website/api-server
   npm install
   npm run dev
   ```

2. **Start Backend**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

3. **Start Frontend**:
   ```bash
   cd website
   npm run start
   ```

## 4. Testing Flow

1. Navigate to `http://localhost:3000/signup`.
2. Complete the 3-step signup.
3. Browse to Chapter 1.
4. Click **"Personalize This Chapter"**.
5. Observe the content change to match your background.
6. Refresh to see the **cached** version load instantly.
