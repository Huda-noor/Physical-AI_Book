# Implementation Plan: Textbook Generation

**Branch**: `001-textbook-generation` | **Date**: 2025-12-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/textbook-generation/spec.md`

## Summary

Build an AI-Native textbook with 6 structured chapters on Physical AI & Humanoid Robotics using Docusaurus 3.x for static site generation and a free-tier RAG chatbot powered by FastAPI, Qdrant, and Neon PostgreSQL. The system must support semantic search with source citations, text-selection-based Q&A, and deploy to GitHub Pages with <3min builds and <2s page loads.

**Technical Approach**:
- **Frontend**: Docusaurus 3.x + React 18 + TypeScript for static site with auto-generated sidebar
- **Backend**: FastAPI + Python 3.11 for RAG API with rate limiting and CORS
- **Vector DB**: Qdrant Community Cloud for 384-dim embeddings (MiniLM-L6)
- **Metadata Store**: Neon PostgreSQL free tier for chunk metadata and query logs
- **Deployment**: GitHub Pages (frontend), Railway/Render free tier (backend)

## Technical Context

**Language/Version**:
- **Frontend**: TypeScript 5.x, Node.js 18 LTS
- **Backend**: Python 3.11+

**Primary Dependencies**:
- **Frontend**: Docusaurus 3.5.x, React 18.2+, @docusaurus/preset-classic
- **Backend**: FastAPI 0.110+, sentence-transformers 2.6+, qdrant-client 1.8+, psycopg2-binary 2.9+

**Storage**:
- **Vector Store**: Qdrant Cloud Community (1GB limit, 384-dim vectors)
- **Relational DB**: Neon PostgreSQL free tier (0.5GB storage, 100 hours compute/month)
- **Static Assets**: GitHub Pages (1GB repo limit, CDN-backed)

**Testing**:
- **Frontend**: Jest 29+ for unit tests, @testing-library/react for component tests
- **Backend**: pytest 8+ for API tests, pytest-asyncio for async tests
- **E2E**: Playwright (optional) for critical user journeys
- **Coverage Target**: >80% for backend, >70% for frontend

**Target Platform**:
- **Frontend Build**: Node.js 18+ on GitHub Actions runner (ubuntu-latest)
- **Frontend Runtime**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Backend Runtime**: Python 3.11+ on Railway/Render free tier (Linux containers)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- **Frontend**: FCP <1.5s, TTI <3s, LCP <2.5s, CLS <0.1 (Lighthouse >90)
- **Backend**: API p95 <2s, p50 <1s, embedding generation <500ms, vector search <200ms
- **Build**: Full build <3min, incremental <30s
- **Throughput**: 100 concurrent users, 10,000 page views/day, 1,000 chatbot queries/day

**Constraints**:
- **Free-Tier Limits**: Qdrant <1GB, Neon <0.5GB storage + 100h compute/month
- **Rate Limiting**: 10 requests/min per IP on chatbot API
- **Bundle Size**: Frontend <200KB initial JS, images lazy-loaded
- **CPU-Only**: No GPU for embeddings (sentence-transformers on CPU)
- **Content**: Exactly 6 chapters, 10-25 pages each, max 120 total pages

**Scale/Scope**:
- **Content**: 6 chapters (~600 sections), ~3000 content chunks for RAG indexing
- **Users**: 1,000 DAU expected, scaling to 10,000 DAU without architecture changes
- **Codebase**: Estimated 15K LOC (10K TypeScript, 5K Python)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Simplicity Over Complexity
- ✅ **PASS**: Single static site (Docusaurus) + single API (FastAPI), minimal dependencies
- ✅ **PASS**: Standard tools (React, TypeScript, Python) without exotic frameworks
- ✅ **PASS**: Flat content structure (6 chapters in `/docs` folder)

### II. Content Quality & Accuracy (NON-NEGOTIABLE)
- ✅ **PASS**: Chapter template enforces Learning Objectives, Core Concepts, Practical Application, Summary
- ✅ **PASS**: All code examples must be tested before inclusion (SC-003)
- ✅ **PASS**: Peer review process defined in spec (FR-002)

### III. AI-Native Design
- ✅ **PASS**: Semantic chunking at heading/paragraph boundaries (FR-014)
- ✅ **PASS**: Metadata-rich chunks (chapter_id, section_title, content_type) for retrieval
- ✅ **PASS**: Self-contained sections to optimize embedding quality
- ✅ **PASS**: Zero hallucination constraint - answers ONLY from book content (FR-023, SC-012)

### IV. Modern, Clean UI/UX
- ✅ **PASS**: Docusaurus default theme (clean, professional, battle-tested)
- ✅ **PASS**: Mobile-first responsive design (NFR-025 to NFR-030)
- ✅ **PASS**: WCAG 2.1 AA compliance required (NFR-025, SC-016)
- ✅ **PASS**: Performance budgets enforced (SC-005 to SC-008)

### V. Free-Tier Architecture
- ✅ **PASS**: All services on free tiers (Qdrant Community, Neon free, GitHub Pages, Railway/Render free)
- ✅ **PASS**: Lightweight embeddings (384-dim MiniLM-L6, <100MB model)
- ✅ **PASS**: CPU-only operations, no GPU (TC-015)
- ✅ **PASS**: Rate limiting prevents abuse (10 req/min per IP)

### VI. Consistent Structure & Formatting
- ✅ **PASS**: Enforced chapter template (constitution.md:92-117)
- ✅ **PASS**: Automated style checking (SC-004: >90% consistency)
- ✅ **PASS**: Markdown formatting standards (code blocks with language, alt text for images)

### VII. Performance & Build Efficiency
- ✅ **PASS**: Build time <3min (SC-009, NFR-005)
- ✅ **PASS**: Page load metrics defined (FCP <1.5s, TTI <3s)
- ✅ **PASS**: Bundle size constrained (<200KB initial JS)

**Gate Status**: ✅ **ALL GATES PASS** - Proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/textbook-generation/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (entities and relationships)
├── quickstart.md        # Phase 1 output (developer setup guide)
└── contracts/           # Phase 1 output (API contracts)
    ├── openapi.yaml     # OpenAPI 3.1 spec for FastAPI endpoints
    └── rag-pipeline.md  # RAG indexing and query pipeline specification
```

### Source Code (repository root)

```text
# Option 2: Web application (frontend + backend)

# Frontend (Docusaurus static site)
website/
├── docs/                           # Chapter content (markdown)
│   ├── chapter-1-introduction-to-physical-ai.md
│   ├── chapter-2-basics-of-humanoid-robotics.md
│   ├── chapter-3-ros-2-fundamentals.md
│   ├── chapter-4-digital-twin-simulation.md
│   ├── chapter-5-vision-language-action-systems.md
│   └── chapter-6-capstone-ai-robot-pipeline.md
├── static/                         # Images, assets
│   ├── img/                        # Chapter images
│   └── css/                        # Custom styles
├── src/                            # React components
│   ├── components/
│   │   ├── ChatbotModal.tsx       # Chatbot UI modal
│   │   ├── ChatbotIcon.tsx        # Floating chatbot button
│   │   ├── TextSelector.tsx       # Text selection handler
│   │   ├── PersonalizeButton.tsx  # Placeholder for personalization
│   │   └── TranslateButton.tsx    # Placeholder for Urdu translation
│   ├── hooks/
│   │   └── useChatbot.ts          # Chatbot API integration hook
│   ├── theme/                      # Docusaurus theme customization
│   │   └── Root.tsx               # Global provider for chatbot state
│   └── css/
│       └── custom.css             # Custom styles (spacing, colors)
├── docusaurus.config.ts           # Docusaurus configuration
├── sidebars.ts                     # Sidebar structure (auto-generated from docs)
├── package.json                    # Frontend dependencies
├── tsconfig.json                   # TypeScript configuration
└── .env.example                    # Environment variables template

# Backend (FastAPI RAG API)
backend/
├── app/
│   ├── main.py                     # FastAPI app entry point
│   ├── config.py                   # Environment variables, settings
│   ├── models/
│   │   ├── schemas.py              # Pydantic models (QueryRequest, QueryResponse)
│   │   └── entities.py             # SQLAlchemy models (ChunkMetadata, QueryLog)
│   ├── services/
│   │   ├── embeddings.py           # Sentence-transformers wrapper
│   │   ├── qdrant_client.py        # Qdrant vector search
│   │   ├── neon_client.py          # Neon PostgreSQL client
│   │   └── rag_service.py          # RAG pipeline orchestration
│   ├── routers/
│   │   ├── query.py                # POST /api/query endpoint
│   │   └── health.py               # GET /api/health endpoint
│   ├── middleware/
│   │   ├── rate_limit.py           # Rate limiting (10 req/min per IP)
│   │   └── cors.py                 # CORS configuration
│   └── utils/
│       ├── chunking.py             # Semantic text chunking
│       ├── sanitization.py         # Input sanitization
│       └── logging.py              # Structured logging
├── scripts/
│   ├── index_chapters.py           # Index chapter markdown into Qdrant
│   ├── setup_db.py                 # Initialize Neon PostgreSQL schema
│   └── test_pipeline.py            # Test RAG pipeline end-to-end
├── tests/
│   ├── test_api.py                 # API endpoint tests
│   ├── test_rag_service.py         # RAG service unit tests
│   └── test_chunking.py            # Chunking logic tests
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
└── Dockerfile                      # Container for Railway/Render deployment

# Shared
.github/
├── workflows/
│   ├── frontend-deploy.yml         # GitHub Actions: Build + deploy to GitHub Pages
│   ├── backend-deploy.yml          # GitHub Actions: Deploy backend to Railway/Render
│   └── test.yml                    # GitHub Actions: Run tests on PR
└── dependabot.yml                  # Auto-update dependencies

.gitignore                          # Ignore node_modules, .env, etc.
README.md                           # Project overview and setup instructions
```

**Structure Decision**:
Selected **Option 2: Web application** with separate `website/` (frontend) and `backend/` (API) directories. This separation enables:
- Independent deployment pipelines (GitHub Pages for frontend, Railway for backend)
- Clear ownership of static content vs. dynamic API logic
- Easier local development (run frontend and backend servers independently)

**Rationale**:
- Monorepo approach keeps all code in single repository for simplicity
- Frontend is self-contained Docusaurus site with custom React components for chatbot UI
- Backend is self-contained FastAPI service with clear layers (routers, services, models)
- Shared configuration via `.github/workflows` for unified CI/CD

## Complexity Tracking

> **No violations detected** - All constitutional principles satisfied without exceptions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

---

## Phase 0: Research

**Objective**: Resolve all NEEDS CLARIFICATION items from Technical Context and document technology decisions.

No unresolved items - all technical context is well-defined. Research document will capture best practices and integration patterns.

## Phase 1: Design

**Objective**: Generate data model, API contracts, and quickstart guide based on research findings.

### Data Model (data-model.md)
- Entities: Chapter, Section, ContentChunk, ChatQuery, ChatResponse
- Relationships and foreign keys
- Validation rules from functional requirements

### API Contracts (contracts/)
- OpenAPI 3.1 specification for FastAPI endpoints
- RAG pipeline flow diagram and specifications

### Quickstart Guide (quickstart.md)
- Local development setup instructions
- Environment variable configuration
- How to run frontend and backend servers
- How to index chapters and test RAG pipeline

---

**Next Steps**: Execute Phase 0 (generate research.md) and Phase 1 (generate data-model.md, contracts/, quickstart.md).

**Branch**: `001-textbook-generation` (create from master)
**Implementation Plan Path**: `specs/textbook-generation/plan.md`
