---
id: 001
title: Phase 3 Constitution Creation
stage: constitution
date: 2025-01-01
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: developer
command: sp.constitution
labels: ["constitution", "governance", "authentication", "personalization", "phase-3"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - None (governance documentation)
---

## Prompt

(Phase 3 Rules & Guidelines)
Objective: Implement authentication using Better Auth, collect user software/hardware background at signup, and enable content personalization per chapter.
Core Rules:

Use Better-Auth.com with Neon Postgres.
At signup: Ask detailed questions about software (e.g., Python, ROS) and hardware (GPU, Jetson) experience.
Store background in user profile.
Add "Personalize This Chapter" button at top of each chapter.
On click: Send chapter text + user background → OpenAI → return personalized version.
Personalization must adapt difficulty, examples, and explanations.

User requested creation of project constitution incorporating Phase 3 requirements for authentication, user profiles, and content personalization.

## Response snapshot

Successfully created comprehensive constitution (Version 2.0.0) for Physical AI & Humanoid Robotics textbook project.

**Constitution Structure:**

Created 7 core principles governing all development:

1. **User-Centric Education**: Prioritize student learning outcomes over technical sophistication
   - Accuracy targets: 90%+ correct chapter citations
   - Response clarity appropriate for skill level
   - Mobile-friendly, low-cost infrastructure

2. **Cost-Conscious Architecture**: Optimize for free-tier services, <$20/month operational cost
   - Free tiers: Qdrant (1GB), Neon (0.5GB), Railway (500 hrs/month)
   - Cost per query: <$0.05 (OpenAI embeddings + GPT-4o-mini)
   - Budget monitoring and alerts required

3. **Authentication & User Profiles** (Phase 3): Better Auth with detailed background collection
   - Collect: Software experience (Python, ROS, etc.), robotics experience, hardware access
   - Store: `user_profiles` table with JSON fields
   - Privacy: User control over data, GDPR compliance
   - Security: JWT tokens, HttpOnly cookies, CSRF protection

4. **Content Personalization** (Phase 3): OpenAI-powered chapter adaptation
   - "Personalize This Chapter" button on every chapter
   - Adapts: Difficulty level, examples, explanations based on user background
   - Quality: Maintain technical accuracy, preserve concept coverage
   - Caching: Store per (user_id, chapter_id, profile_hash)
   - Endpoint: `POST /api/personalize` with chapter + profile

5. **RAG Pipeline Integrity**: High-quality semantic search and answer generation
   - Embeddings: OpenAI text-embedding-ada-002 (1536 dims)
   - Chunking: 800 chars with 200 overlap
   - Performance: <3s query response (p95), <500ms vector search
   - Quality: Source citations, no hallucinations

6. **Incremental Delivery**: User story organization for independent implementation
   - Each story independently testable
   - MVP first (smallest valuable increment)
   - Parallel execution opportunities marked
   - No cross-story dependencies

7. **Security & Privacy**: Protect student data with enterprise standards
   - HTTPS only, rate limiting, input validation
   - Minimal data collection, user data control
   - GDPR/COPPA compliance
   - Chat history client-side only

**Additional Sections:**

- **Technical Standards**: Required stack (FastAPI, Better Auth, OpenAI, Qdrant, Neon, Railway, Docusaurus)
- **Development Workflow**: Feature lifecycle (specify → plan → tasks → implement → deploy)
- **Governance**: Amendment process, versioning policy, compliance review, conflict resolution

**Version Information:**

- **Version**: 2.0.0 (initial constitution)
- **Ratification Date**: 2025-01-01
- **Last Amended**: 2025-01-01
- **Bump Rationale**: MAJOR version for initial constitution establishing governance for existing project

**Sync Impact Report:**

Templates requiring updates:
- ⚠️ `.specify/templates/plan-template.md` - Add Constitution Check for 7 principles
- ⚠️ `.specify/templates/spec-template.md` - Ensure personalization requirements section
- ⚠️ `.specify/templates/tasks-template.md` - Add auth/personalization task categories
- ⚠️ `README.md` - Reference constitution principles

**Constitution Compliance Checks Defined:**

Every plan must validate:
- ✅ User-Centric Education: Improves learning?
- ✅ Cost-Conscious: Within budget?
- ✅ Authentication (Phase 3+): Respects privacy and Better Auth standards?
- ✅ Personalization (Phase 3+): Maintains technical accuracy?
- ✅ RAG Integrity: Maintains search quality?
- ✅ Incremental Delivery: User stories independent?
- ✅ Security & Privacy: Student data protected?

**Quality Gates Established:**

Before merging:
- Constitution principles validated
- Type checks pass (TypeScript, Python)
- Linters pass (ESLint, Flake8)
- Documentation updated
- User story test criteria met
- No security vulnerabilities
- Cost impact analyzed

## Outcome

- ✅ Impact: Created foundational governance document (constitution v2.0.0) establishing 7 core principles for Physical AI textbook project. Principles III and IV specifically address Phase 3 requirements (Better Auth authentication + OpenAI personalization). Constitution now guides all future development.
- 🧪 Tests: No tests for governance documentation. Constitution itself defines testing requirements for features (Principle VI).
- 📁 Files: Created .specify/memory/constitution.md with complete principles, technical standards, development workflow, and governance process.
- 🔁 Next prompts: Update plan/spec/tasks templates to include constitution compliance checks. Create Phase 3 specification for authentication and personalization features. Run `/sp.specify` for Phase 3.
- 🧠 Reflection: Constitution created retrospectively for existing project with Phase 2 complete. Principles codify architectural decisions already made (RAG pipeline, cost optimization, incremental delivery) and establish new requirements for Phase 3 (Better Auth, user profiles, personalization). Version 2.0.0 reflects initial governance establishment.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution successfully created with all placeholders filled
- Graders run and results (PASS/FAIL): PASS - All 7 principles clear and testable, no bracket placeholders remaining, version/dates correct, sync impact report included
- Prompt variant (if applicable): N/A (standard sp.constitution command)
- Next experiment (smallest change to try): Run sp.specify for Phase 3 to create authentication and personalization feature spec that validates against new constitution principles III and IV.
