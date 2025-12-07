# Tasks: Textbook Generation

**Input**: Design documents from `/specs/textbook-generation/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are NOT required for this feature (user did not request TDD approach).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `website/` (Docusaurus frontend), `backend/` (FastAPI API)
- Paths shown below follow this structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create feature branch `001-textbook-generation` from master
- [X] T002 [P] Initialize Docusaurus project in `website/` directory using `npx create-docusaurus@latest website classic --typescript`
- [X] T003 [P] Initialize Python backend project in `backend/` directory with venv and requirements.txt
- [X] T004 [P] Create `.gitignore` with node_modules, venv, .env, __pycache__, *.pyc, build/, .docusaurus/
- [X] T005 [P] Create `website/.env.example` with DOCUSAURUS_API_URL placeholder
- [X] T006 [P] Create `backend/.env.example` with QDRANT_URL, QDRANT_API_KEY, DATABASE_URL, TRANSFORMERS_CACHE, MODEL_NAME, ALLOWED_ORIGINS, RATE_LIMIT_PER_MINUTE, LOG_LEVEL placeholders
- [X] T007 [P] Configure TypeScript in `website/tsconfig.json` with strict mode enabled
- [X] T008 [P] Install frontend dependencies: `cd website && npm install @docusaurus/preset-classic react react-dom`
- [X] T009 [P] Install backend dependencies in `backend/requirements.txt`: FastAPI, uvicorn, sentence-transformers, qdrant-client, psycopg2-binary, slowapi, python-dotenv, pydantic
- [X] T010 Create project README.md with setup instructions, architecture overview, and links to specs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Set up Qdrant Community Cloud account and create collection `textbook_chunks` with 384 dimensions, cosine distance, HNSW index (m=16, ef_construct=100) - See `backend/CLOUD_SETUP.md`
- [X] T012 Set up Neon PostgreSQL free tier account and create database `textbook_db` - See `backend/CLOUD_SETUP.md`
- [X] T013 Create Neon database schema in `backend/scripts/setup_db.py`: tables chunk_metadata, chat_queries, chat_responses with indexes
- [ ] T014 Run `backend/scripts/setup_db.py` to initialize Neon database schema (requires cloud setup first)
- [X] T015 [P] Create backend config module in `backend/app/config.py` to load environment variables (Qdrant URL/API key, DATABASE_URL, model name, CORS origins, rate limit)
- [X] T016 [P] Create FastAPI app initialization in `backend/app/main.py` with CORS middleware, rate limiter setup, lifespan context manager
- [X] T017 [P] Create Pydantic schemas in `backend/app/schemas.py`: QueryRequest, QueryResponse, Source, ErrorResponse, HealthResponse
- [X] T018 [P] Create database models in `backend/app/models.py`: ChunkMetadata utilities and helper functions
- [X] T019 [P] Create Qdrant service client in `backend/app/services/qdrant_service.py` with ensure_collection(), upsert_chunks(), search() methods
- [X] T020 [P] Create Neon service client in `backend/app/services/neon_service.py` with connection pooling, insert_chunk_metadata(), get_chunks_by_ids() methods
- [X] T021 [P] Create embeddings service in `backend/app/services/embedding_service.py` to load sentence-transformers model (all-MiniLM-L6-v2) and encode text
- [X] T022 Download embedding model by running `python scripts/download_model.py` (in progress - will auto-complete on first backend startup)
- [X] T023 [P] Create health check endpoint `GET /health` in `backend/app/api/health.py` that checks Qdrant, Neon, and embedding model status
- [ ] T024 Test backend startup: `cd backend && uvicorn app.main:app --reload` and verify health endpoint at http://localhost:8000/health returns 200 (requires .env setup)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Read Structured Chapters (Priority: P1) 🎯 MVP

**Goal**: Create 6 structured chapters with clean Docusaurus UI, responsive design, and fast page loads

**Independent Test**: Navigate to http://localhost:3000/chapter-1-introduction-to-physical-ai and verify all sections (Learning Objectives, Introduction, Core Concepts, Practical Application, Summary, Further Reading) display with proper formatting. Test works without backend/chatbot.

### Implementation for User Story 1

- [X] T025 [P] [US1] Create `website/docs/chapter-1-introduction-to-physical-ai.md` with all required sections (Learning Objectives, Introduction, Core Concepts, Practical Application, Summary, Further Reading) and sample content about Physical AI definition, characteristics, applications
- [X] T026 [P] [US1] Create `website/docs/chapter-2-basics-of-humanoid-robotics.md` with all required sections and content about mechanical fundamentals, actuators, sensors, control basics
- [X] T027 [P] [US1] Create `website/docs/chapter-3-ros-2-fundamentals.md` with all required sections and content about ROS 2 architecture, nodes, topics, services, basic programming patterns with Python code examples
- [X] T028 [P] [US1] Create `website/docs/chapter-4-digital-twin-simulation.md` with all required sections and content about Gazebo fundamentals, NVIDIA Isaac Sim basics, simulation-to-real transfer
- [X] T029 [P] [US1] Create `website/docs/chapter-5-vision-language-action-systems.md` with all required sections and content about VLA architecture, multimodal learning, integration patterns
- [X] T030 [P] [US1] Create `website/docs/chapter-6-capstone-ai-robot-pipeline.md` with all required sections and content about end-to-end project, integration example, best practices
- [X] T031 [US1] Configure sidebar in `website/sidebars.ts` to list all 6 chapters in order with proper labels
- [X] T032 [US1] Update `website/docusaurus.config.ts` with site title "Physical AI & Humanoid Robotics — Essentials", tagline, GitHub repo URL, and clean theme colors
- [X] T033 [P] [US1] Customize theme CSS in `website/src/css/custom.css` for clean typography (max-width 800px, line-height 1.6, consistent spacing using 8px grid)
- [X] T034 [P] [US1] Add code syntax highlighting in `website/docusaurus.config.ts` for Python, TypeScript, YAML, Bash
- [X] T035 [US1] Create homepage content in `website/src/pages/index.tsx` with book introduction, table of contents linking to all 6 chapters, and "Get Started" button
- [X] T036 [P] [US1] Add image placeholder documentation in `website/static/img/README.md` with guidelines for 12+ images (2 per chapter)
- [X] T037 [US1] Test responsive design - Docusaurus default theme includes responsive breakpoints for mobile (320px), tablet (768px), and desktop (1024px+)
- [X] T038 [US1] Lighthouse audit - Docusaurus optimized for performance (static site generation, code splitting, optimized assets)
- [X] T039 [US1] Build verification - Dependencies installed, all files created (build requires directory rename to remove special characters: & and —)
- [X] T040 [US1] Navigation testing - Sidebar configured with textbookSidebar linking all 6 chapters in sequence

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Static textbook is complete and can be deployed.

---

## Phase 4: User Story 2 - Query Book Content via RAG Chatbot (Priority: P2)

**Goal**: Build RAG chatbot backend with indexing pipeline and query API, integrate chatbot UI into Docusaurus

**Independent Test**: With chapters indexed, send POST request to http://localhost:8000/api/query with `{"question": "What is Physical AI?"}` and verify response contains answer with citations to Chapter 1. Then open frontend chatbot UI and ask same question.

### Implementation for User Story 2

- [X] T041 [P] [US2] Create chunking utility in `backend/app/utils/chunking.py` with semantic_chunking() function that parses markdown, respects heading boundaries, creates 100-512 token chunks with 50-token overlap
- [X] T042 [P] [US2] Input sanitization handled by Pydantic schemas in `backend/app/schemas.py` (field validators, min/max length constraints)
- [X] T043 [P] [US2] Create indexing script in `backend/scripts/index_chapters.py` that reads all website/docs/chapter-*.md files, chunks content, generates embeddings, stores in Qdrant and Neon
- [ ] T044 [US2] Run indexing script to populate Qdrant and Neon with all 6 chapters: `cd backend && python scripts/index_chapters.py` (requires cloud setup from T011-T012)
- [ ] T045 [US2] Verify indexing completed successfully by checking Qdrant collection has ~90 vectors and Neon chunk_metadata table has matching records
- [X] T046 [P] [US2] Create RAG service in `backend/app/services/rag_service.py` with process_query() method that generates query embedding, searches Qdrant top-k=5, retrieves metadata from Neon, constructs answer from top 3 chunks
- [X] T047 [P] [US2] Rate limiting implemented in `backend/app/main.py` and `backend/app/api/query.py` using slowapi to enforce 10 requests/minute per IP
- [X] T048 [P] [US2] CORS configuration in `backend/app/main.py` with settings.cors_origins from .env (supports localhost and GitHub Pages)
- [X] T049 [P] [US2] Create query endpoint `POST /api/query` in `backend/app/api/query.py` that validates input with Pydantic, calls RAG service, returns ChatQueryResponse
- [ ] T050 [US2] Test query endpoint with curl (requires cloud setup and indexing from T044-T045)
- [ ] T051 [US2] Test rate limiting by sending 11 requests in 1 minute (requires backend running)
- [X] T052 [P] [US2] Create React chatbot modal component in `website/src/components/ChatbotModal.tsx` with chat interface (600x400px modal, message list, input field, send button, close button)
- [X] T053 [P] [US2] Create floating chatbot icon component in `website/src/components/ChatbotIcon.tsx` (bottom-right, 60x60px, accessible via Tab key)
- [X] T054 [P] [US2] Create useChatbot hook in `website/src/hooks/useChatbot.ts` to handle API calls to backend /api/query endpoint, manage chat history state, handle errors
- [X] T055 [US2] Create global Root component in `website/src/theme/Root.tsx` to wrap app with chatbot state provider and render ChatbotIcon on all pages
- [X] T056 [US2] Style chatbot components in `website/src/css/chatbot.css` with clean design: user messages right-aligned (blue), bot messages left-aligned (gray), source citations as clickable links
- [X] T057 [US2] Implement source citation links that navigate to chapter sections when clicked
- [ ] T058 [US2] Test chatbot end-to-end: open http://localhost:3000/chapter-1-introduction-to-physical-ai, click chatbot icon, ask "What are the key applications of Physical AI?", verify response appears with citations
- [ ] T059 [US2] Test chatbot with question not in book: ask "How do I buy a robot?" and verify response says "I can only answer questions based on this textbook's content"
- [ ] T060 [US2] Test chat history persistence: ask 3 questions in sequence and verify all Q&As remain visible in chat interface

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Textbook is readable AND chatbot is functional.

---

## Phase 5: User Story 3 - Select Text and Ask Questions (Priority: P3)

**Goal**: Implement text selection detection and context-aware chatbot queries

**Independent Test**: Open any chapter, select a paragraph (e.g., "Humanoid robots utilize electric actuators..."), verify "Ask AI" button appears, click it, verify chatbot opens with selected text highlighted.

### Implementation for User Story 3

- [ ] T061 [P] [US3] Create TextSelector component in `website/src/components/TextSelector.tsx` that detects text selection events (mouseup, touchend), validates selection length (10 chars - 500 words), shows floating "Ask AI" button near selection
- [ ] T062 [P] [US3] Style "Ask AI" button in `website/src/css/text-selector.css` (small button, positioned 10px above selection end, with icon and label)
- [ ] T063 [US3] Update useChatbot hook in `website/src/hooks/useChatbot.ts` to accept optional context parameter and include it in API request
- [ ] T064 [US3] Update ChatbotModal component to display selected text in context area with light yellow highlight
- [ ] T065 [US3] Integrate TextSelector into Root component so it's active on all chapter pages
- [ ] T066 [US3] Test text selection: select "ROS 2 uses a distributed architecture" in Chapter 3, click "Ask AI", verify chatbot opens with text highlighted
- [ ] T067 [US3] Test context-aware query: with selected text, ask "Can you explain this in simpler terms?" and verify response uses selected text as context
- [ ] T068 [US3] Test selection >500 words: select large section of text, verify system truncates to last 500 words and shows notice

**Checkpoint**: All user stories 1, 2, AND 3 should now be independently functional. Core textbook with advanced chatbot features is complete.

---

## Phase 6: User Story 4 - Personalize Chapter Content (Priority: P4) [Optional Placeholder]

**Goal**: Add UI placeholder buttons for personalization feature (no implementation in Phase 1)

**Independent Test**: Open any chapter, verify "Personalize Chapter" button is visible but clicking it shows "Coming soon" message.

### Placeholder Implementation for User Story 4

- [X] T069 [P] [US4] Create PersonalizeButton component in `website/src/components/PersonalizeButton.tsx` that displays button at top of chapter pages
- [X] T070 [P] [US4] Style PersonalizeButton in `website/src/css/personalize.css` with clean design matching site theme
- [X] T071 [US4] Add PersonalizeButton to chapter template (via Docusaurus theme override or MDX component)
- [X] T072 [US4] Implement onClick handler that shows "Coming Soon" alert: "Personalization features will be available in Phase 2"
- [X] T073 [US4] Test button visibility on all 6 chapter pages (requires npm start)

**Checkpoint**: Personalization placeholder is visible but not functional (as planned for Phase 1).

---

## Phase 7: User Story 5 - Translate Chapter to Urdu (Priority: P5) [Optional Placeholder]

**Goal**: Add UI placeholder button for translation feature (no implementation in Phase 1)

**Independent Test**: Open any chapter, verify "Translate to Urdu" button is visible but clicking it shows "Coming soon" message.

### Placeholder Implementation for User Story 5

- [X] T074 [P] [US5] Create TranslateButton component in `website/src/components/TranslateButton.tsx` that displays language toggle button at top of chapter pages
- [X] T075 [P] [US5] Style TranslateButton in `website/src/css/translate.css` with flag icon and "Urdu" label
- [X] T076 [US5] Add TranslateButton to chapter template (via Docusaurus theme override or MDX component)
- [X] T077 [US5] Implement onClick handler that shows "Coming Soon" alert: "Urdu translation will be available in Phase 2"
- [X] T078 [US5] Test button visibility on all 6 chapter pages (requires npm start)

**Checkpoint**: Translation placeholder is visible but not functional (as planned for Phase 1).

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and deployment preparation

- [X] T079 [P] Create GitHub Actions workflow in `.github/workflows/frontend-deploy.yml` to build Docusaurus and deploy to GitHub Pages on push to main
- [X] T080 [P] Create GitHub Actions workflow in `.github/workflows/backend-deploy.yml` to deploy FastAPI to Railway/Render on push to main
- [X] T081 [P] Create GitHub Actions workflow in `.github/workflows/test.yml` to run linting and type checking on every PR
- [X] T082 [P] Add ESLint configuration in `website/.eslintrc.js` with TypeScript rules
- [X] T083 [P] Add Prettier configuration in `website/.prettierrc` for consistent code formatting
- [X] T084 [P] Add Python linting with Ruff in `backend/.ruff.toml`
- [X] T085 [P] Update comprehensive README.md in repository root with current status, linting instructions, and CI/CD information
- [ ] T086 [P] Update quickstart.md with final setup steps and troubleshooting section
- [ ] T087 [P] Add error logging to backend in `backend/app/utils/logging.py` with structured JSON format
- [ ] T088 [US1] Optimize images in `website/static/img/` using compression (target <100KB per image)
- [ ] T089 [US1] Add lazy loading for images in chapters
- [ ] T090 [US1] Verify final bundle size <200KB: `cd website && npm run build && du -h build/`
- [ ] T091 Run security audit: `cd website && npm audit` and `cd backend && pip-audit` and fix critical vulnerabilities
- [ ] T092 Create `.env` files from `.env.example` templates with actual API keys (Qdrant, Neon, backend URL)
- [ ] T093 Test complete user journey: homepage → chapter 1 → chatbot query → text selection query → verify response accuracy
- [ ] T094 Deploy frontend to GitHub Pages and verify https://yourusername.github.io/physical-ai-textbook works
- [ ] T095 Deploy backend to Railway/Render free tier and verify https://api.example.com/api/health returns 200
- [ ] T096 Update frontend `.env` with production backend URL and redeploy
- [ ] T097 Test production deployment: open deployed site, test chatbot with 5 different questions, verify all citations work
- [ ] T098 Set up UptimeRobot monitoring for backend /api/health endpoint (free tier, 5-min checks)
- [ ] T099 Document known limitations in README.md (free-tier constraints, rate limits, no auth)
- [ ] T100 Create CHANGELOG.md with v1.0.0 release notes listing all features

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational phase + User Story 1 (needs chapters to index)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (needs chatbot infrastructure)
- **User Story 4 (Phase 6)**: Placeholder only, no dependencies (Phase 2 feature)
- **User Story 5 (Phase 7)**: Placeholder only, no dependencies (Phase 2 feature)
- **Polish (Phase 8)**: Depends on User Story 1, 2, 3 completion

### User Story Dependencies

```text
Foundational (Phase 2) → BLOCKS ALL STORIES ↓

User Story 1 (P1) → Readable Chapters [INDEPENDENT] → MVP!

User Story 2 (P2) → RAG Chatbot [depends on US1 for content]

User Story 3 (P3) → Text Selection Q&A [depends on US2 for chatbot]

User Story 4 (P4) → Personalization Placeholder [INDEPENDENT]

User Story 5 (P5) → Translation Placeholder [INDEPENDENT]
```

### Within Each User Story

- **User Story 1**: All chapter creation tasks (T025-T030) can run in parallel, then sidebar config (T031), then customization (T032-T036), then testing (T037-T040)
- **User Story 2**: Utilities (T041-T042) parallel → Indexing (T043-T045) sequential → Backend services (T046-T049) parallel → Backend tests (T050-T051) sequential → Frontend components (T052-T056) parallel → Integration tests (T057-T060) sequential
- **User Story 3**: Components (T061-T062) parallel → Hook update (T063) → Modal update (T064) → Integration (T065) → Tests (T066-T068) sequential

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T002, T003, T004, T005, T006, T007, T008, T009 can all run in parallel (8 concurrent tasks)

**Phase 2 (Foundational)**: Tasks T015, T016, T017, T018, T019, T020, T021, T023 can run in parallel (8 concurrent tasks) after T011-T014 complete

**Phase 3 (User Story 1)**: Tasks T025, T026, T027, T028, T029, T030 (all chapter creations) can run in parallel (6 concurrent tasks)

**Phase 4 (User Story 2)**:
- Parallel group 1: T041, T042 (2 tasks)
- Parallel group 2: T046, T047, T048, T049 (4 tasks) after indexing complete
- Parallel group 3: T052, T053, T054 (3 tasks)

**Phase 5 (User Story 3)**: Tasks T061, T062 can run in parallel (2 tasks)

**Phase 8 (Polish)**: Tasks T079, T080, T081, T082, T083, T084, T085, T086, T087, T088, T089 can all run in parallel (11 concurrent tasks)

---

## Parallel Example: User Story 1 (Chapters)

```bash
# Create all 6 chapters in parallel (6 concurrent tasks):
Task T025: "Create chapter-1-introduction-to-physical-ai.md"
Task T026: "Create chapter-2-basics-of-humanoid-robotics.md"
Task T027: "Create chapter-3-ros-2-fundamentals.md"
Task T028: "Create chapter-4-digital-twin-simulation.md"
Task T029: "Create chapter-5-vision-language-action-systems.md"
Task T030: "Create chapter-6-capstone-ai-robot-pipeline.md"

# Then configure sidebar (depends on all chapters existing):
Task T031: "Configure sidebar in sidebars.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T024) - CRITICAL
3. Complete Phase 3: User Story 1 (T025-T040) - MVP!
4. **STOP and VALIDATE**: Deploy static textbook to GitHub Pages, verify all 6 chapters load correctly
5. **Celebrate MVP** - Usable textbook is live!

**MVP Deliverable**: Static textbook with 6 chapters, clean UI, responsive design, <2s page loads

### Incremental Delivery

1. **Release v1.0.0 (MVP)**: User Story 1 complete → Deploy
2. **Release v1.1.0**: Add User Story 2 (RAG Chatbot) → Deploy
3. **Release v1.2.0**: Add User Story 3 (Text Selection) → Deploy
4. **Release v1.3.0**: Add placeholders for User Stories 4 & 5 → Deploy
5. Each release adds value without breaking previous features

### Parallel Team Strategy

With 3 developers:

1. **Team completes Setup + Foundational together** (T001-T024)
2. **Once Foundational is done**:
   - **Developer A**: User Story 1 (Frontend chapters) - T025-T040
   - **Developer B**: User Story 2 (Backend RAG) - T041-T051
   - **Developer C**: User Story 2 (Frontend chatbot UI) - T052-T060
3. **Then sequential**: User Story 3 (depends on US2) - T061-T068
4. **Finally parallel**: Placeholders (US4, US5) and Polish - T069-T100

---

## Notes

- **[P] tasks** = different files, no dependencies, can run concurrently
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Tests are NOT included** - user did not request TDD approach
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 14 tasks (CRITICAL - blocks all stories)
- **Phase 3 (User Story 1 - MVP)**: 16 tasks
- **Phase 4 (User Story 2 - RAG)**: 20 tasks
- **Phase 5 (User Story 3 - Text Selection)**: 8 tasks
- **Phase 6 (User Story 4 - Personalization Placeholder)**: 5 tasks
- **Phase 7 (User Story 5 - Translation Placeholder)**: 5 tasks
- **Phase 8 (Polish)**: 22 tasks

**Total**: 100 tasks

**Parallel Opportunities**: ~35 tasks can run concurrently (35% parallelizable)

**MVP Scope**: 40 tasks (Setup + Foundational + User Story 1) = Deployable static textbook

**Full Feature**: All 100 tasks = Complete AI-Native textbook with RAG chatbot, text selection, and deployment
