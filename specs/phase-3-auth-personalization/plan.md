# Implementation Plan: Authentication & Content Personalization

**Branch**: `main` | **Date**: 2025-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/phase-3-auth-personalization/spec.md`

## Summary

Implement secure user authentication using Better Auth with Neon PostgreSQL, collecting detailed student backgrounds during signup (software experience, hardware access, learning goals). Enable AI-powered chapter personalization via "Personalize This Chapter" buttons that generate tailored content using OpenAI GPT-4o-mini, adapting difficulty level, examples, and explanations to match each student's profile. Personalized versions are cached per user/chapter to minimize API costs while maintaining instant toggle between original and personalized content.

## Technical Context

**Language/Version**: Python 3.10+ (backend), TypeScript 5.6+ (frontend), Node.js 20.x (Better Auth)
**Primary Dependencies**:
- Backend: Better Auth 1.4.9+, FastAPI 0.110+ (existing), OpenAI SDK 1.12+ (existing)
- Frontend: Better Auth React SDK, React Hook Form 7.5+, React 18+ (existing)

**Storage**:
- User accounts: Neon PostgreSQL via Better Auth (reuse existing database)
- User profiles: New `user_profiles` table in Neon
- Personalized content cache: New `personalized_chapters` table in Neon
- Session storage: sessionStorage for UI state

**Testing**:
- Backend: pytest for auth endpoints, profile CRUD
- Frontend: Jest + React Testing Library for signup/signin flows
- Integration: E2E tests with Better Auth authentication flow
- Security: Auth vulnerability scanning, CSRF protection tests

**Target Platform**:
- Backend: Railway (existing deployment, add auth routes)
- Frontend: Vercel (existing deployment, add auth pages)
- Database: Neon PostgreSQL (existing, extend schema)

**Project Type**: Web application (extend existing backend + frontend)

**Performance Goals**:
- Signup flow: <2 seconds per step
- Profile save: <1 second
- Chapter personalization: <10 seconds (p95)
- Toggle content: <100ms (cached)
- Concurrent personalizations: 5+ simultaneous users

**Constraints**:
- Better Auth server-side rendering compatibility with Docusaurus
- OpenAI API costs: <$0.30 per chapter personalization
- Caching strategy: Invalidate on profile update
- Rate limiting: 3 personalizations per minute per user
- Memory: <100MB additional backend, <50KB frontend bundle increase

**Scale/Scope**:
- Expected users: 50-100 registered students initially
- Personalization combinations: ~500 unique profiles × 6 chapters = 3,000 cached versions max
- Storage: ~10MB per personalized chapter × 3,000 = 30GB (within Neon paid tier if needed)
- Profile size: ~2KB per user × 100 users = 200KB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Validating against Constitution v2.0.0** (`.specify/memory/constitution.md`)

### ✅ I. User-Centric Education
**Does this feature improve learning outcomes?**
- ✅ **PASS**: Personalization directly improves comprehension by matching content to student's existing knowledge
- Evidence: Students learn better with familiar examples (Python dev sees Python code vs generic pseudocode)
- Educational Value: Adaptive difficulty prevents frustration (beginners) and boredom (advanced students)

### ✅ II. Cost-Conscious Architecture
**Will this stay within budget constraints (<$20/month)?**
- ✅ **PASS with Monitoring**:
  - Better Auth: Free (self-hosted)
  - Personalization: ~$0.15 per chapter × 6 chapters × 50 users = $45 one-time
  - Caching reduces repeat costs to near-zero
  - Incremental rollout: Monitor costs, pause if exceeds budget
- Mitigation: Implement daily budget cap, alert at $10 threshold

### ✅ III. Authentication & User Profiles (Phase 3)
**Does this respect privacy and Better Auth standards?**
- ✅ **PASS**: Explicitly follows Principle III requirements:
  - Using Better Auth v1.4.9+ with Neon PostgreSQL ✅
  - Collecting detailed background (software, hardware, goals) ✅
  - Profile storage in extensible JSON fields ✅
  - User privacy controls (edit, delete, skip questions) ✅
  - Secure session management (JWT, HttpOnly cookies, CSRF) ✅

### ✅ IV. Content Personalization (Phase 3)
**Does personalization maintain technical accuracy?**
- ✅ **PASS**: Explicitly follows Principle IV requirements:
  - "Personalize This Chapter" button on every chapter ✅
  - OpenAI GPT-4o-mini with background context ✅
  - Adapts difficulty, examples, explanations ✅
  - Quality standards: Preserve concepts, technical accuracy ✅
  - Caching per (user_id, chapter_id, profile_hash) ✅
  - User control: Toggle original/personalized ✅

### ✅ V. RAG Pipeline Integrity
**Does this maintain semantic search quality?**
- ✅ **PASS**: No changes to existing RAG pipeline
- Personalization is separate feature, doesn't affect chatbot
- Both use OpenAI GPT-4o-mini (consistent quality)

### ✅ VI. Incremental Delivery
**Are user stories independently implementable?**
- ✅ **PASS**: Two independent user stories:
  - US1 (Sign Up): Can test signup without personalization
  - US2 (Personalize): Can test with mock profiles initially
  - MVP = US1 + US2 (both P1, deliver together for value)
  - US3 (Manage Profile): Adds later, doesn't break US1/US2
  - US4 (Persist Preferences): Enhancement, independent

### ✅ VII. Security & Privacy
**Are student data and credentials protected?**
- ✅ **PASS**:
  - Better Auth handles password hashing, JWT signing ✅
  - HTTPS only (Vercel + Railway enforce) ✅
  - Rate limiting on auth (Better Auth default) + personalization (3/min) ✅
  - CSRF protection (Better Auth built-in) ✅
  - Profile data encrypted at rest (Neon TLS) ✅
  - GDPR compliance (export, delete, consent) ✅
  - No sensitive data in logs ✅

**Overall Constitution Check**: ✅ **PASS** - All 7 principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/phase-3-auth-personalization/
├── spec.md              # This feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 output (TO BE CREATED)
├── data-model.md        # Phase 1 output (TO BE CREATED)
├── quickstart.md        # Phase 1 output (TO BE CREATED)
├── contracts/           # Phase 1 output (TO BE CREATED)
│   ├── auth-api.yaml    # Better Auth endpoints
│   └── personalize-api.yaml  # Personalization endpoint
└── tasks.md             # Phase 2 output (/sp.tasks - NOT by /sp.plan)
```

### Source Code Extensions (repository root)

```text
# Backend extensions
backend/
├── app/
│   ├── auth/                         # NEW: Better Auth integration
│   │   ├── __init__.py
│   │   ├── config.py                 # Better Auth configuration
│   │   ├── schemas.py                # Auth request/response models
│   │   └── routes.py                 # Auth endpoints
│   ├── models/                       # NEW: Database models
│   │   ├── __init__.py
│   │   ├── user_profile.py           # UserProfile model
│   │   └── personalized_chapter.py   # PersonalizedChapter model
│   ├── services/
│   │   ├── profile_service.py        # NEW: Profile CRUD operations
│   │   └── personalization_service.py # NEW: Content personalization logic
│   ├── api/
│   │   ├── profile.py                # NEW: Profile endpoints
│   │   └── personalize.py            # NEW: Personalization endpoint
│   └── utils/
│       └── profile_hash.py           # NEW: Profile hashing for cache
├── migrations/                       # NEW: Database migrations
│   └── 001_add_user_profiles.sql
└── .env.example                      # UPDATED: Add Better Auth secrets

# Frontend extensions
website/
├── src/
│   ├── pages/
│   │   ├── signup.tsx                # NEW: Multi-step signup form
│   │   ├── signin.tsx                # UPDATED: Better Auth integration
│   │   └── profile.tsx               # UPDATED: Profile management
│   ├── components/
│   │   ├── SignupForm.tsx            # UPDATED: Multi-step with background
│   │   ├── PersonalizeButton.tsx     # NEW: Chapter personalization button
│   │   └── PersonalizedContent.tsx   # NEW: Personalized chapter display
│   ├── contexts/
│   │   └── AuthContext.tsx           # UPDATED: Add profile to auth state
│   ├── hooks/
│   │   ├── usePersonalization.ts     # NEW: Personalization logic hook
│   │   └── useProfile.ts             # NEW: Profile management hook
│   └── auth/
│       └── config.ts                 # UPDATED: Better Auth client config
└── package.json                      # UPDATED: Add better-auth, react-hook-form
```

**Structure Decision**: Extending existing web application structure. Backend adds authentication and personalization services while reusing FastAPI infrastructure. Frontend adds auth pages and personalization UI while reusing Docusaurus theme system. This approach:
- Minimizes changes to existing working code (Phase 2 RAG chatbot)
- Reuses Neon PostgreSQL database (add tables vs new database)
- Maintains single deployment (Railway backend, Vercel frontend)
- Keeps clear API boundaries (auth, personalization separate from RAG)

## Complexity Tracking

> **Constitution compliance review**

| Aspect | Constitution Principle | Justification |
|--------|----------------------|---------------|
| Better Auth dependency | III. Authentication | Required by constitution. Better Auth is standardized auth provider for project. No violation. |
| Multi-step signup | I. User-Centric Education | Detailed background collection enables better personalization. Trade-off: Longer signup vs better learning experience. Justified by educational value. |
| OpenAI personalization costs | II. Cost-Conscious | ~$0.15 per chapter × 6 = $0.90 per user one-time cost. Caching prevents repeat costs. Monitoring and budget caps required per constitution. |
| Profile data collection | VII. Security & Privacy | Constitution requires minimal collection and user control. Implementation provides: skip questions, edit profile, delete account, GDPR export. Compliant. |

**No constitution violations** - All architectural choices align with established principles.

---

## Phase 0: Research & Technology Validation

### Research Questions

#### Q1: Better Auth Integration Strategy
**Question**: How to integrate Better Auth with FastAPI backend and React frontend in a Docusaurus project?

**Research Tasks**:
- Better Auth Python/FastAPI adapter options
- Better Auth React SDK compatibility with Docusaurus
- Session management across backend (Railway) and frontend (Vercel)
- Database schema requirements for Better Auth + profiles

**Status**: NEEDS CLARIFICATION - Research required

#### Q2: Profile Collection UX
**Question**: What's the optimal signup flow for collecting detailed background without overwhelming users?

**Research Tasks**:
- Multi-step form best practices (3-4 steps vs single long form)
- Optional vs required fields (balance data quality vs signup friction)
- Progress indicators and skip options
- Mobile-responsive form design

**Status**: NEEDS CLARIFICATION - Research required

#### Q3: Personalization Prompt Engineering
**Question**: How to structure GPT-4o-mini prompts for accurate, useful chapter personalization?

**Research Tasks**:
- System prompt templates for difficulty adaptation
- Example replacement strategies (preserve correctness)
- Token limits for chapter-length content (6-12 pages)
- Quality validation (automated checks for hallucinations)

**Status**: NEEDS CLARIFICATION - Research required

#### Q4: Content Caching Strategy
**Question**: Where and how to cache personalized chapters for cost optimization?

**Research Tasks**:
- Database cache (Neon PostgreSQL) vs object storage (S3)
- Cache invalidation: When to regenerate (profile update, chapter edit)
- Cache key: MD5 hash of profile JSON vs explicit versioning
- Storage estimates: 10MB × 3,000 combinations = 30GB?

**Status**: NEEDS CLARIFICATION - Research required

#### Q5: Better Auth Database Schema
**Question**: What tables does Better Auth require in Neon PostgreSQL?

**Research Tasks**:
- Better Auth default schema (users, sessions, accounts, verification_tokens)
- Custom field extensions (link to user_profiles)
- Migration scripts and setup
- Compatibility with existing Neon database

**Status**: NEEDS CLARIFICATION - Research required

---

## Phase 1: Design & Contracts

**Status**: Pending Phase 0 research completion

Will generate:
- `data-model.md` - UserProfile, PersonalizedChapter entities
- `contracts/auth-api.yaml` - Better Auth endpoints
- `contracts/personalize-api.yaml` - Personalization endpoint
- `quickstart.md` - Testing auth and personalization locally

---

## Phase 2: Task Decomposition

**Status**: Run `/sp.tasks` after Phase 1 complete

---

## Deployment Strategy

### Backend Deployment (Railway)
- Extend existing FastAPI app with auth routes
- Add Better Auth middleware
- Run database migration for new tables
- Add environment variables (BETTER_AUTH_SECRET, BETTER_AUTH_URL)
- Redeploy to Railway

### Frontend Deployment (Vercel)
- Add Better Auth React SDK
- Create signup/signin/profile pages
- Update AuthContext with profile
- Add PersonalizeButton to chapter layout
- Add environment variables (NEXT_PUBLIC_BETTER_AUTH_URL)
- Redeploy to Vercel

### Database Migration
1. Run migration in Neon SQL Editor:
   - Create user_profiles table
   - Create personalized_chapters table
   - Link to Better Auth users table
2. Verify tables created
3. Test profile CRUD operations

### Rollback Strategy
- Database: Migrations are additive (no data loss on rollback)
- Backend: Redeploy previous Railway commit
- Frontend: Vercel instant rollback
- Feature flags: Disable personalization button if API issues

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Better Auth integration complexity | Medium | High | Research thoroughly in Phase 0, use official adapters, test auth flow early |
| Personalization costs exceed budget | Medium | High | Implement caching, daily budget cap ($5), monitor usage, alert at threshold |
| Signup friction reduces adoption | High | Medium | Make background questions optional, show value ("Get personalized content!"), test UX |
| Personalized content has hallucinations | Medium | High | Quality validation prompts, user feedback ("Report issue" button), regenerate option |
| Profile data privacy concerns | Low | Critical | Follow GDPR/COPPA, clear privacy policy, minimal data collection, user control |
| Cache storage exceeds Neon free tier | Medium | Medium | Monitor storage (0.5GB free), compress markdown, upgrade to paid if needed ($14/month) |

---

## Success Criteria

✅ **Functional**:
- Users can sign up with detailed background profiles
- Users can sign in and session persists across pages
- Users can view and edit their profiles
- "Personalize This Chapter" button appears on all 6 chapters
- Personalized content adapts difficulty and examples correctly
- Toggle between original and personalized works instantly

✅ **Performance**:
- Signup flow <2s per step
- Chapter personalization <10s (p95)
- Profile updates <1s
- Content toggle <100ms (cached)

✅ **Quality**:
- 80%+ users complete profile during signup
- 85%+ satisfaction with personalized content
- 95%+ technical accuracy (no hallucinations)
- 0 authentication security incidents

✅ **Cost**:
- <$5/month for 50 active students
- Personalization: ~$0.90 per user one-time (6 chapters)
- Caching reduces repeat costs >95%

✅ **Security**:
- Passwords hashed (bcrypt)
- JWT tokens secure (HttpOnly, Secure, SameSite)
- Rate limiting prevents abuse
- CSRF protection enabled
- No data breaches

---

## Implementation Status

📋 **Phase 0 (Research)**: Pending - 5 research questions to resolve
📋 **Phase 1 (Design)**: Pending - Awaits Phase 0 completion
📋 **Phase 2 (Tasks)**: Pending - Run `/sp.tasks` after Phase 1
📋 **Implementation**: Not started
📋 **Deployment**: Pending

---

## Next Actions

1. **Phase 0 Research**: Resolve 5 research questions
   - Q1: Better Auth + FastAPI integration
   - Q2: Multi-step signup UX
   - Q3: Personalization prompt engineering
   - Q4: Content caching strategy
   - Q5: Better Auth database schema

2. **Phase 1 Design**: Create design artifacts
   - `data-model.md` - UserProfile and PersonalizedChapter models
   - `contracts/auth-api.yaml` - Better Auth endpoints
   - `contracts/personalize-api.yaml` - Personalization endpoint
   - `quickstart.md` - Local testing guide

3. **Phase 2 Tasks**: Run `/sp.tasks` to generate task breakdown

4. **Implementation**: Follow task list with incremental delivery

5. **Deployment**: Follow DEPLOYMENT.md with Phase 3 extensions

---

**Plan Version**: 1.0 | **Last Updated**: 2025-01-01
