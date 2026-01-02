# Better Auth Sidecar

Authentication sidecar server for Phase 3 - Authentication & Personalization feature.

## Purpose

This sidecar provides Better Auth-compatible endpoints using Neon PostgreSQL as the database. It handles all authentication operations (signup, signin, signout, session management) independently of the main FastAPI backend.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Frontend   │────>│  Auth Sidecar   │────>│   Neon DB   │
│ (Docusaurus)│     │  (Node.js/Hono)  │     │ PostgreSQL  │
└─────────────┘     │  Port: 3001      │     └─────────────┘
                    └──────────────────┘
```

## Setup

### Prerequisites

1. Node.js 20+ installed
2. Neon PostgreSQL database running
3. Database schema created (run migrations first)

### Installation

```bash
cd backend/auth-sidecar
npm install
```

### Configuration

Create a `.env` file in the `auth-sidecar` directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-domain.vercel.app

# Server Port
PORT=3001

# Password Salt (generate random string)
PASSWORD_SALT=your-random-salt-here
```

### Development

```bash
npm run dev
```

Server runs at http://localhost:3001

### Production

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/auth/signup

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": false,
    "name": "John Doe"
  }
}
```

### POST /api/auth/signin

Sign in an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": false,
    "name": "John Doe"
  },
  "session": {
    "id": "uuid",
    "expiresAt": "2025-01-09T00:00:00.000Z"
  }
}
```

**Cookies:** Sets `better-auth.session_token` (HttpOnly, Secure, SameSite=Lax, 7-day expiry)

### GET /api/auth/session

Get current session.

**Headers:**
- `Cookie: better-auth.session_token=...`
- Or `Authorization: Bearer ...`

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "expiresAt": "2025-01-09T00:00:00.000Z",
    "sessionToken": "...",
    "createdAt": "2025-01-02T00:00:00.000Z"
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": false,
    "name": "John Doe",
    "image": null,
    "createdAt": "2025-01-02T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
}
```

**Error:** 401 if no valid session

### POST /api/auth/signout

Sign out and delete session.

**Response:**
```json
{
  "success": true
}
```

**Cookies:** Clears `better-auth.session_token`

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "better-auth-sidecar",
  "version": "1.0.0"
}
```

## Deployment

### Railway

1. Connect this directory as a service
2. Set root directory: `backend/auth-sidecar`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables from `.env.example`
6. Deploy

### Vercel

Not recommended (Node.js sidecar should run on Railway with backend).

## Security Notes

- Passwords are hashed with SHA-256 + salt (upgrade to bcrypt in production)
- Sessions expire after 7 days
- HttpOnly, Secure cookies prevent XSS attacks
- SameSite=Lax prevents CSRF attacks
- CORS restricted to specific origins

## Future Enhancements

- [ ] Replace SHA-256 with bcrypt for password hashing
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Social OAuth (GitHub, Google)
- [ ] Rate limiting on signup/signin
- [ ] Session refresh tokens
