# Research: Authentication & Content Personalization

## Q1: Better Auth Integration Strategy
**Decision**: Sidecar Auth Server Pattern.
**Rationale**: Better Auth is a Node.js-only framework (v1.4.9). The project will run a small Hono/Node.js server for authentication logic, which the FastAPI backend will query for session verification.
**Implementation**:
- Better Auth Server: Node.js/Hono on Port 3001.
- Backend Verification: FastAPI middleware calls `GET /auth/session` on the auth server.
- Frontend: Better Auth React SDK in Docusaurus.

## Q2: Profile Collection UX
**Decision**: 3-Step Guided Signup.
**Rationale**: Minimizes dropout rates while ensuring data quality.
**Flow**:
1. **Basics**: Name, Email, Password (Required).
2. **Experience**: Software (Python/ROS/C++) & Robotics Level (Required).
3. **Context**: Hardware access & Learning goals (Required/Optional mix).
**UX Features**: Progress bar, tooltips for skill levels, "Personalize my experience" value proposition.

## Q3: Personalization Prompt Engineering
**Decision**: Modular System Prompts + Semantic Sectioning.
**Rationale**: Ensures technical accuracy while adapting to levels.
**Prompts**:
- **Difficulty**: Beginner (analogies), Intermediate (best practices), Advanced (architecture/optimization).
- **Examples**: Conditional code blocks based on "Hardware Access" (Simulated vs Real).
- **Chunking**: Split chapters >8 pages into semantic chunks to manage context window limits and improve streaming responsiveness.

## Q4: Content Caching Strategy
**Decision**: Hybrid Storage (S3 + Neon).
**Rationale**: Performance and cost optimization.
**Architecture**:
- **Neon (PostgreSQL)**: Stores `cache_metadata` (cache keys, profile hashes, expiration).
- **S3 (Object Storage)**: Stores actual personalized markdown files (~10MB/chapter).
- **Cache Key**: `hash(chapter_id + chapter_version + profile_hash)`.
- **Invalidation**: Clear user cache on profile update; clear all users' chapter cache on textbook source update.

## Q5: Better Auth Database Schema
**Decision**: Native Better Auth tables + Extensible Profiles.
**Rationale**: Matches Better Auth's expected internal structure for security and ease of updates.
**Tables**: `user`, `session`, `account`, `verification`.
**Extensions**: `user_profiles` table linked via `user_id` (UUID).
