# Feature Specification: Authentication & Content Personalization

**Feature**: Phase 3 - Authentication and Personalized Learning
**Date**: 2025-01-01
**Status**: Planning
**Depends On**: Phase 2 RAG Chatbot (Complete)

## Overview

Implement user authentication using Better Auth and enable AI-powered content personalization based on student background. Students will create accounts with detailed software/hardware profiles, then receive personalized chapter content tailored to their experience level and familiar technologies.

## Goals

1. Secure user authentication with Better Auth and Neon PostgreSQL
2. Collect detailed student background during signup (software, hardware, goals)
3. Store profiles in extensible database schema
4. Add "Personalize This Chapter" button to all 6 chapters
5. Generate personalized content using OpenAI GPT-4o-mini
6. Maintain technical accuracy while adapting difficulty and examples

## Functional Requirements

### FR1: Better Auth Integration
- Implement Better Auth v1.4.9+ with Neon PostgreSQL backend
- Support email/password authentication
- Prepare for social OAuth (GitHub, Google) in future
- Secure session management with JWT tokens
- HttpOnly cookies with CSRF protection

### FR2: Enhanced Signup Flow
- Create multi-step signup form collecting:
  - **Basic Info**: Email, password, full name
  - **Software Experience** (checkboxes + skill levels):
    - Python (beginner/intermediate/advanced)
    - JavaScript/TypeScript (beginner/intermediate/advanced)
    - C/C++ (beginner/intermediate/advanced)
    - ROS 2 (none/basic/intermediate/advanced)
    - Other languages (free text)
  - **Robotics Experience** (radio buttons):
    - No experience
    - Simulation only (Gazebo, Isaac Sim, etc.)
    - Real hardware (robot kits, custom builds)
  - **Hardware Access** (checkboxes):
    - GPU (NVIDIA, AMD)
    - NVIDIA Jetson (Nano, Xavier, Orin)
    - Robot kits (TurtleBot, Fetch, custom)
    - Sensors (LiDAR, cameras, IMU)
    - None of the above
  - **Learning Goals** (checkboxes):
    - Career change to robotics
    - Academic research
    - Hobby/personal projects
    - Professional development
- Validate all inputs before submission
- Allow users to skip optional questions
- Store in `user_profiles` table

### FR3: User Profile Management
- Profile page showing all collected data
- Edit profile functionality
- View personalization preferences
- Delete account (GDPR compliance)
- Export data as JSON

### FR4: Chapter Personalization Button
- Add "Personalize This Chapter" button at top of each chapter page
- Button states:
  - Disabled if not logged in (prompt to sign in)
  - "Personalize" when ready
  - "Personalizing..." during API call
  - "View Original" when personalized version shown
- Toggle between original and personalized versions
- Cache personalized versions client-side (sessionStorage)

### FR5: Personalization API
- Endpoint: `POST /api/personalize`
- Request: `{ chapter_id: int, user_profile: UserProfile }`
- Process:
  1. Load chapter markdown from `/website/docs`
  2. Extract user background from profile
  3. Generate personalization prompt for GPT-4o-mini
  4. Stream or return personalized markdown
  5. Cache result in database for reuse
- Response: `{ personalized_content: str, cache_hit: bool, generation_time_ms: int }`

### FR6: Dynamic Content Replacement
- Parse personalized markdown on frontend
- Replace chapter content with personalized version
- Maintain navigation and UI elements
- Preserve code blocks and diagrams (no personalization)
- Highlight changes or adaptations (optional visual indicator)

## Non-Functional Requirements

### Performance
- Signup flow: <2 seconds per step
- Profile save: <1 second
- Personalization generation: <10 seconds for full chapter
- Toggle original/personalized: <100ms (instant from cache)

### Reliability
- Auth system: 99.9% uptime (Better Auth SLA)
- Personalization: Graceful fallback to original if API fails
- Profile data: Automatic backups with Neon

### Security
- Passwords hashed with bcrypt (Better Auth default)
- JWT tokens with 7-day expiration
- Rate limiting: 3 personalizations per minute per user
- No profile data in logs or error messages
- SQL injection prevention (parameterized queries)

### Cost
- Better Auth: Free (self-hosted with Neon)
- OpenAI Personalization: ~$0.10-0.30 per chapter (one-time per user per chapter)
- Caching: Reduce repeat costs to near-zero
- Target: <$5/month for 50 active students

### Privacy
- GDPR compliance: Data export, deletion, consent
- Minimal data collection (only for personalization)
- Profile data encrypted at rest
- Chat history client-side only (not server)
- Clear privacy policy

## User Stories

### US1: Sign Up with Background Profile (Priority: P1) 🎯 MVP
**As a** new student
**I want to** create an account with my software/hardware background
**So that** I can receive personalized content tailored to my experience

**Acceptance Criteria:**
- User navigates to /signup
- User fills multi-step form:
  - Step 1: Email, password, confirm password
  - Step 2: Software experience checkboxes + levels
  - Step 3: Robotics experience + hardware access
  - Step 4: Learning goals
- System validates inputs at each step
- System creates user account in Better Auth
- System stores profile in `user_profiles` table
- User redirected to homepage with logged-in state

### US2: Personalize Chapter Content (Priority: P1) 🎯 MVP
**As a** logged-in student
**I want to** personalize chapter content based on my background
**So that** I see examples and explanations that match my experience level

**Acceptance Criteria:**
- User logged in and viewing Chapter 1
- User clicks "Personalize This Chapter" button
- System shows loading state
- System calls `/api/personalize` with chapter 1 + user profile
- OpenAI generates personalized version:
  - Adjusted difficulty (e.g., beginner gets more explanation)
  - Tailored examples (e.g., Python user sees Python code)
  - Relevant context (e.g., "Since you have GPU access...")
- System displays personalized content
- User can toggle back to original
- Personalized version cached for instant replay

### US3: Manage Profile (Priority: P2)
**As a** registered student
**I want to** view and update my profile
**So that** I can keep my background current and improve personalization

**Acceptance Criteria:**
- User navigates to /profile
- User sees current profile data (software, hardware, goals)
- User clicks "Edit Profile"
- User updates any field (e.g., adds ROS 2 experience)
- User saves changes
- System updates `user_profiles` table
- Future personalizations use updated profile

### US4: Persist Personalized Preferences (Priority: P3)
**As a** student who personalizes chapters
**I want to** automatically see personalized versions on return visits
**So that** I don't have to regenerate every time

**Acceptance Criteria:**
- User personalizes Chapter 2
- User closes browser
- User returns next day
- User navigates to Chapter 2
- System automatically loads cached personalized version
- User can still toggle to original if desired

## Technical Stack

### Backend Extensions
- **Authentication**: Better Auth 1.4.9+ (Python/Node.js agnostic)
- **Session Store**: Neon PostgreSQL (reuse existing database)
- **Profile Storage**: New `user_profiles` table in Neon
- **Personalization**: OpenAI GPT-4o-mini API

### Frontend Extensions
- **Auth UI**: Better Auth React components
- **Forms**: React Hook Form with validation
- **State**: AuthContext (existing) extended with profile
- **Routing**: New pages: /signup, /signin, /profile
- **Storage**: sessionStorage for personalized content cache

### Database Schema Extensions

```sql
-- User profiles table (extends Better Auth users)
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,

    -- Software Experience (JSON for flexibility)
    software_experience JSONB DEFAULT '{}',
    -- Example: {"python": "advanced", "javascript": "intermediate", "ros2": "basic"}

    -- Robotics Experience
    robotics_experience VARCHAR(50) DEFAULT 'none',
    -- Values: 'none', 'simulation_only', 'real_hardware'

    -- Hardware Access (JSON array)
    hardware_access JSONB DEFAULT '[]',
    -- Example: ["gpu_nvidia", "jetson_nano", "lidar"]

    -- Learning Goals (JSON array)
    learning_goals JSONB DEFAULT '[]',
    -- Example: ["career_change", "academic_research"]

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personalized content cache
CREATE TABLE personalized_chapters (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user(id) ON DELETE CASCADE,
    chapter_id INTEGER NOT NULL,
    profile_hash VARCHAR(64) NOT NULL,  -- MD5 of profile JSON
    personalized_content TEXT NOT NULL,
    generation_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, chapter_id, profile_hash)
);
```

## Architecture

```
┌─────────────────────────────────────────┐
│      User (Browser)                     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Frontend (Vercel - Docusaurus + React) │
│  ┌────────────────────────────────┐    │
│  │ Better Auth React Components   │    │
│  │  ├─ SignupForm (multi-step)    │    │
│  │  ├─ SigninForm                 │    │
│  │  └─ ProfilePage                │    │
│  ├────────────────────────────────┤    │
│  │ Personalization UI             │    │
│  │  ├─ PersonalizeButton          │    │
│  │  ├─ PersonalizedContent        │    │
│  │  └─ ToggleOriginal             │    │
│  └────────────────────────────────┘    │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Backend (Railway - FastAPI)           │
│  ┌────────────────────────────────┐    │
│  │ Better Auth Server             │    │
│  │  ├─ /auth/signup               │    │
│  │  ├─ /auth/signin               │    │
│  │  └─ /auth/session              │    │
│  ├────────────────────────────────┤    │
│  │ Personalization API            │    │
│  │  └─ POST /api/personalize      │    │
│  │     1. Load chapter markdown   │    │
│  │     2. Extract user profile    │    │
│  │     3. Generate prompt         │    │
│  │     4. Call GPT-4o-mini        │    │
│  │     5. Cache result            │    │
│  └────────────────────────────────┘    │
└──────────────┬──────────────────────────┘
               │
               ↓
      ┌────────┴────────┐
      ↓                 ↓
┌──────────┐      ┌──────────┐
│   Neon   │      │  OpenAI  │
│PostgreSQL│      │    API   │
│  - users │      │ GPT-4o   │
│ -profiles│      │   mini   │
│  - cache │      └──────────┘
└──────────┘
```

## Out of Scope (Phase 3)

- Social OAuth providers (GitHub, Google) - Phase 4
- Team/classroom features - Phase 4
- Progress tracking dashboard - Phase 4
- Personalized quizzes/exercises - Phase 5
- Learning path recommendations - Phase 5
- Multi-language personalization - Phase 5
- Voice input/output - Future
- Mobile native apps - Future

## Success Metrics

1. **Adoption**: 80%+ of users complete profile during signup
2. **Usage**: 60%+ of users personalize at least one chapter
3. **Quality**: 85%+ satisfaction with personalized content (survey)
4. **Performance**: <10s chapter personalization time (p95)
5. **Cost**: <$5/month for 50 active students
6. **Security**: Zero authentication breaches or data leaks
