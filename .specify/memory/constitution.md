<!--
SYNC IMPACT REPORT
Version change: 2.0.0 → 2.1.0
List of modified principles: None (adding new principle)
Added sections: VIII. Multilingual Content Translation (Phase 4)
Removed sections: None
Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Should include principle VIII check
  ✅ .specify/templates/spec-template.md - Should include translation requirements section
  ⚠ .specify/templates/tasks-template.md - Should add translation task categories
  ✅ .specify/templates/phr-template.prompt.md - Already supports new principles
Follow-up TODOs: Run /sp.spec for Phase 4 to create translation feature specification
-->

# Physical AI & Humanoid Robotics Textbook Constitution

## Core Principles

### I. User-Centric Education
Prioritize student learning outcomes over technical sophistication. Every feature MUST improve comprehension, accessibility, or engagement.

**Rules:**
- Accuracy targets: 90%+ correct answers (RAG citations)
- Response clarity: Language complexity matched to user's skill level
- Mobile-friendly: All features work on mobile devices (responsive design)
- Low-cost infrastructure: Prefer free-tier services, monitor usage aggressively

### II. Cost-Conscious Architecture
Optimize for free-tier services, maintain <$20/month operational cost for core features.

**Rules:**
- Use free tiers whenever possible: Qdrant (1GB), Neon (0.5GB), Railway (500 hrs/month)
- Cost per query: <$0.05 (OpenAI embeddings + GPT-4o-mini)
- Budget monitoring: Alert at $10/month threshold, pause if exceeds $20/month
- Caching strategy: Cache frequently accessed content to reduce API calls >95%

### III. Authentication & User Profiles (Phase 3)
Secure user authentication using Better Auth with Neon PostgreSQL, collecting detailed background data for personalization.

**Rules:**
- Use Better-Auth v1.4.9+ with Neon PostgreSQL backend
- Collect detailed background at signup:
  - Software experience (Python, ROS 2, C++, JavaScript/TypeScript levels: none/beginner/intermediate/advanced)
  - Robotics experience (none/simulation only/real hardware)
  - Hardware access (GPU, Jetson, robot kits, sensors - checkboxes)
  - Learning goals (career change, academic research, hobby, professional development)
- Store in extensible JSON fields: `user_profiles.software_experience`, `hardware_access`, `learning_goals`
- User privacy controls: Edit profile, skip optional questions, export data, delete account (GDPR)
- Secure session management:
  - JWT tokens with 7-day expiration
  - HttpOnly cookies, Secure flag, SameSite=Lax
  - CSRF protection (Better Auth built-in)
- Rate limiting: Auth endpoints (Better Auth default) + personalization (3 per minute per user)

### IV. Content Personalization (Phase 3)
Enable AI-powered chapter personalization adapting difficulty, examples, and explanations to each student's background using OpenAI GPT-4o-mini.

**Rules:**
- "Personalize This Chapter" button on every chapter page (disabled if not logged in)
- Personalization endpoint: `POST /api/personalize` with `chapter_id` parameter
- Prompt engineering: Inject `user_profile` + `chapter_markdown` into system prompt
- Adapts:
  - Difficulty: Beginner gets more verbose explanations; advanced gets technical terminology
  - Examples: Python user sees Python code; ROS 2 user sees ROS 2 examples
  - Context: "Since you have GPU access..." or "For simulation-only setups..."
- Quality standards:
  - Preserve all chapter headings and subheadings exactly
  - Do not remove core concepts or technical definitions
  - Keep code blocks valid and functional
- Caching: Store per `(user_id, chapter_id, profile_hash)` for instant replay
- User control: Toggle button between original and personalized versions
- Rate limiting: 3 personalizations per minute per user

### V. RAG Pipeline Integrity
Maintain high-quality semantic search and answer generation using OpenAI embeddings and GPT-4o-mini.

**Rules:**
- Embeddings: OpenAI `text-embedding-ada-002` (1536 dimensions)
- Chunking strategy: 800 characters with 200 character overlap
- Vector search: Qdrant Cloud, return top 5-10 chunks per query
- Performance: <3s query response (p95), <500ms vector search
- Answer generation: GPT-4o-mini, system prompt emphasizing source citations
- Quality: Source citations required, no hallucinations, factual consistency
- Full-book mode: Search all chapters for general questions
- Selected-text mode: Process user-selected text directly for context-specific questions

### VI. Incremental Delivery
Organize work into user stories that are independently testable and deliverable without cross-story dependencies.

**Rules:**
- Each user story MUST be independently testable
- MVP first: Deliver smallest valuable increment (P1 priority)
- Parallel execution: Tasks marked [P] can run concurrently; others must be sequential
- No cross-story dependencies: US1, US2, US3 should not block each other
- Feature flags: Disable incomplete features via configuration
- Code review: All changes reviewed before merging
- Testing: Unit + integration tests for each story

### VII. Security & Privacy
Protect student data and credentials with enterprise-grade security standards.

**Rules:**
- HTTPS only: Vercel + Railway enforce HTTPS
- Input validation: All user inputs validated (email format, password strength)
- Rate limiting: All endpoints rate-limited (auth: default, RAG: 10/min, personalization: 3/min)
- Minimal data collection: Only collect data essential for personalization
- User data control:
  - Export: Users can download all their data (GDPR)
  - Delete: Users can delete account and all associated data
  - Edit: Users can update profile at any time
- GDPR/COPPA compliance: Privacy policy, consent checkboxes, age verification
- No sensitive data in logs: Never log passwords, session tokens, or PII
- Encryption at rest: Neon PostgreSQL uses TLS encryption
- Chat history: Client-side only (localStorage), not stored on server

### VIII. Multilingual Content Translation (Phase 4)
Add translation feature for logged-in users to translate any chapter into Urdu, German, or French on demand.

**Rules:**
- Translation only for authenticated users: Require valid session to access translation
- "Translate" button with language dropdown:
  - Options: English (original/revert), Urdu, German, French
  - Positioned at top of each chapter page (next to "Personalize" button)
- Translation engine: OpenAI GPT-4o-mini for high-quality translation
- Preserve technical accuracy:
  - Code blocks: Must NOT be translated (keep English)
  - Technical terms: Keep original English terminology where appropriate (e.g., "tensor", "gradient descent")
  - Formatting: Preserve Markdown structure, headings, lists, tables
- Language-specific guidance:
  - System prompt instructs: "Translate this technical content about Physical AI and Humanoid Robotics"
  - Target audience: Students reading in Urdu, German, or French (not native English speakers)
- Caching (optional bonus):
  - Store translations in `translated_chapters` table
  - Cache key: `(user_id, chapter_id, target_language)`
  - Cache invalidation: Regenerate if chapter source changes
- Revert to English: Always provide option to view original English text
- Cost management:
  - Translation cost: ~$0.05-0.10 per chapter (estimate based on GPT-4o-mini)
  - Budget monitoring: Include translation in monthly cost tracking
  - Rate limiting: 5 translations per minute per user

## Technical Standards

**Required Technology Stack:**
- Backend: FastAPI 0.110+ (Python 3.10+)
- Frontend: Docusaurus 3.9+ (React 18+, TypeScript 5.6+)
- Authentication: Better Auth 1.4.9+ (Node.js sidecar)
- Database: Neon PostgreSQL (psycopg2-binary 2.9+)
- Vector DB: Qdrant Cloud 1.8+ (qdrant-client)
- AI Services: OpenAI GPT-4o-mini, text-embedding-ada-002
- Object Storage: S3-compatible (boto3 1.28+)

**Type Safety:**
- TypeScript strict mode enabled
- Pydantic models for all API request/response
- `any` types prohibited (use explicit types)
- Type validation at build time

**Code Quality:**
- Python: Flake8 linting, type hints (mypy)
- TypeScript: ESLint + Prettier formatting
- Format: PEP 8 (Python), Prettier (TypeScript)
- Documentation: Docstrings for all functions/classes (Google style)

## Development Workflow

Feature lifecycle following Spec-Driven Development (SDD):

1. **Specification**: `/sp.specify` - Create detailed feature requirements (spec.md)
2. **Planning**: `/sp.plan` - Generate architecture plan (plan.md) with constitution compliance check
3. **Tasks**: `/sp.tasks` - Break down into testable, dependency-ordered tasks (tasks.md)
4. **Implementation**: `/sp.implement` - Execute tasks following TDD approach
5. **Validation**: Testing, code review, security audit
6. **Deployment**: Update environment variables, deploy to Railway/Vercel
7. **PHR Recording**: Every prompt recorded in `history/prompts/` for traceability

**Quality Gates:**
- Before implementation: Plan must pass constitution compliance check
- Before merge: All tests pass, type checks pass, linters pass
- Before deploy: Security audit complete, cost impact analyzed

## Governance

### Amendment Process
All constitutional amendments require:
1. **Documentation**: Record rationale in PHR (Prompt History Record)
2. **Proposal**: Submit amendment with clear justification
3. **Review**: Verify alignment with existing principles
4. **Approval**: Project maintainer approval required
5. **Migration**: Update dependent artifacts (templates, docs)
6. **Versioning**: Increment semantic version (MAJOR/MINOR/PATCH)

### Versioning Policy
- **MAJOR**: Backward-incompatible principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording fixes, typos, non-semantic refinements

### Compliance Review
Every feature plan MUST validate:
- ✅ User-Centric Education: Improves learning outcomes?
- ✅ Cost-Conscious: Within budget constraints?
- ✅ Authentication (Phase 3+): Respects privacy and Better Auth standards?
- ✅ Personalization (Phase 3+): Maintains technical accuracy?
- ✅ RAG Integrity: Maintains search quality?
- ✅ Incremental Delivery: User stories independently implementable?
- ✅ Security & Privacy: Student data protected?
- ✅ Multilingual Translation (Phase 4+): Preserves technical accuracy?

**Runtime Guidance Files:**
- Use this constitution (`.specify/memory/constitution.md`) for architectural decisions
- Refer to feature-specific `specs/{feature}/spec.md` for detailed requirements
- Follow task execution in `specs/{feature}/tasks.md`

**Version**: 2.1.0 | **Ratified**: 2025-01-01 | **Last Amended**: 2026-01-03
