# Task Breakdown: Phase 3 - Authentication & Personalization

This document outlines the dependency-ordered tasks for implementing Phase 3.

**Reference Artifacts:**
- [Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [Research](./research.md)
- [Auth API Contract](./contracts/auth-api.yaml)
- [Personalization API Contract](./contracts/personalize-api.yaml)

---

## 🏗️ Foundational Setup (Common Infrastructure)
Tasks required before functional user stories can be implemented.

- [X] **Task 1: Database Migration - Core Tables**
  - Create `user_profiles` and `personalized_chapters` tables in Neon PostgreSQL per `data-model.md`.
  - Set up necessary UUID extensions and indexes for performance.
  - *Acceptance*: Tables visible in Neon console with correct schema.

- [X] **Task 2: Better Auth Sidecar Setup**
  - Initialize Node.js/Hono sidecar for Better Auth.
  - Configure Better Auth with PostgreSQL adapter (Neon).
  - *Acceptance*: Sidecar runs locally; `GET /api/auth/session` returns 401.

- [X] **Task 3: Backend Auth Middleware**
  - Implement FastAPI middleware to verify Better Auth sessions/JWTs.
  - Create dependency for protected routes (`get_current_user`).
  - *Acceptance*: Protected endpoints return 403 without valid session cookie.

- [X] **Task 4: S3/Object Storage Configuration [P]**
  - Set up S3 bucket for personalized markdown caching.
  - Configure backend environment variables for AWS/S3 access.
  - *Acceptance*: Test script can successfully upload/download a string to S3.

---

## 🎯 US1: Sign Up with Background Profile
Implementation of the multi-step signup and initial profile creation.

- [X] **Task 5: Frontend Auth SDK Integration**
  - Install `@better-auth/react` and configure `authClient` in `website/`.
  - Create `AuthContext` to manage login state and user profile globally.
  - *Acceptance*: App detects logged-in/logged-out state from sidecar.

- [X] **Task 6: Multi-step Signup Form UI**
  - Implement 4-step wizard using `react-hook-form` and `Zod`:
    - Step 1: Credentials (Email/Password).
    - Step 2: Software Skills (Python, ROS 2, etc.).
    - Step 3: Robotics Exp & Hardware Access.
    - Step 4: Learning Goals.
  - *Acceptance*: User can navigate between steps; validation prevents empty required fields.

- [X] **Task 7: Signup Submission Logic**
  - Connect form to Better Auth `signUp.email()`.
  - Create backend endpoint `POST /api/profile` to save background data post-signup.
  - *Acceptance*: New user is created in Auth table AND `user_profiles` table on success.

- [ ] **Task 8: Test: Signup Flow E2E**
  - **Test Case**: Complete signup with specific "Advanced Python" and "Jetson Nano" profile.
  - **Criteria**: User is logged in, and database check confirms profile JSON matches input.

---

## 🎯 US2: Personalize Chapter Content
Implementation of the AI generation and content replacement.

- [X] **Task 9: Personalization Prompt Engineering**
  - Create Jinja2/string templates for GPT-4o-mini.
  - Logic to inject `user_profile` and `chapter_markdown` into the system prompt.
  - *Acceptance*: Prompt includes instructions to "Preserve code blocks" and "Tailor difficulty".

- [X] **Task 10: Personalization API Endpoint**
  - Implement `POST /api/personalize` in FastAPI.
  - Logic: Check DB Cache -> (If miss) Call GPT-4o-mini -> Save to S3 -> Save to DB Cache -> Return.
  - *Acceptance*: Returns personalized markdown for a specific user/chapter.

- [X] **Task 11: Personalization UI (The Button)**
  - Create `PersonalizeButton` component for Docusaurus chapter layout.
  - Manage loading, error, and "Toggle Original" states in local component state.
  - *Acceptance*: Button shows "Personalizing..." spinner and switches to "Show Original" after.

- [X] **Task 12: Content Replacement Engine**
  - Component to render markdown from API while maintaining Docusaurus styling.
  - Use `react-markdown` or similar to handle the dynamic content swap.
  - *Acceptance*: Chapter transitions from original to personalized without page reload.

- [ ] **Task 13: Test: Personalization Accuracy**
  - **Test Case**: Personalize Chapter 1 for a "Beginner" vs "Advanced" user.
  - **Criteria**: "Beginner" version contains more verbose explanations; "Advanced" version uses more technical terminology.

---

## 🎯 US3: Manage Profile
View and edit functionality.

- [X] **Task 14: Profile Management Page**
  - Create `/profile` route showing current background data.
  - Implement "Edit" mode for all software/hardware fields.
  - *Acceptance*: User can see their "Python: Intermediate" status and change it to "Advanced".

- [X] **Task 15: Profile Update & Cache Invalidation**
  - Endpoint `PATCH /api/profile`.
  - Logic: Update `profile_hash` in DB on change (triggers "stale" state for cache).
  - *Acceptance*: Updating profile and then visiting a chapter forces a new personalization run.

---

## 🎯 US4: Persistence & Optimization
Automatic loading and performance tweaks.

- [ ] **Task 16: Automatic Cache Loading**
  - Update Chapter page logic to check for existing `personalized_chapters` record on mount.
  - If match exists (Same hash), fetch from S3 and display immediately.
  - *Acceptance*: Returning to a personalized chapter shows the tailored version by default.

- [X] **Task 17: Performance Monitoring [P]**
  - Add `generation_time_ms` logging to backend.
  - Implement rate limiting (3 per minute) on the personalization endpoint.
  - *Acceptance*: 4th personalization attempt in 60s returns 429 Error.

---

## ✅ Integration & Final Tests
- [ ] **Testing: Full User Journey**
  - Signup -> Personalize Ch1 -> Update Profile -> Re-personalize Ch1.
- [ ] **Testing: Security Audit**
  - Ensure one user cannot fetch another user's personalized cache via ID tampering.
- [ ] **Testing: Cost Check**
  - Run 5 personalizations and verify OpenAI dashboard usage matches expectations (~$0.15/run).
