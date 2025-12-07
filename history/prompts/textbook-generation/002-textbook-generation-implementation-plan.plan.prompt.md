---
id: 002
title: Textbook Generation Implementation Plan
stage: plan
date: 2025-12-01
surface: agent
model: claude-sonnet-4-5-20250929
feature: textbook-generation
branch: master
user: DELL
command: /sp.plan
labels: ["plan", "architecture", "rag-pipeline", "docusaurus", "free-tier"]
links:
  spec: specs/textbook-generation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/textbook-generation/plan.md
  - specs/textbook-generation/research.md
  - specs/textbook-generation/data-model.md
  - specs/textbook-generation/contracts/openapi.yaml
  - specs/textbook-generation/contracts/rag-pipeline.md
  - specs/textbook-generation/quickstart.md
tests:
  - Constitution Check validation (manual, all gates passed)
---

## Prompt

/sp.plan textbook-generation

Generate a clean, minimal, production-ready implementation plan for the "textbook-generation" feature.
The plan must include:

- Folder and file structure for Docusaurus.
- Chapter creation workflow (6 short chapters).
- Sidebar and routing setup.
- UI customization steps (clean, modern, minimal).
- RAG chatbot architecture using:
  - FastAPI backend
  - Qdrant (vector store)
  - Neon Postgres (metadata)
  - Lightweight embeddings (free-tier friendly)
- Text-selection-based Q&A workflow.
- API endpoints, data flow, and integration steps.
- Build, test, and deployment steps for GitHub Pages.
- Optional hooks for:
  - Personalize Chapter button
  - Urdu Translation button

Keep the plan concise, professional, and sequential.
Focus on speed, clarity, and free-tier compatibility.

## Response snapshot

Generated comprehensive implementation plan with Phase 0 (Research) and Phase 1 (Design) artifacts:

**plan.md** - Main implementation plan:
- Summary: AI-Native textbook with Docusaurus 3.x + FastAPI + Qdrant + Neon stack
- Technical Context: All NEEDS CLARIFICATION items resolved (TS 5.x, Node 18, Python 3.11, FastAPI 0.110+, Qdrant 1GB, Neon 0.5GB free tier)
- Constitution Check: ✅ ALL 7 PRINCIPLES PASS (no violations, no complexity justifications needed)
- Project Structure: Web application with `website/` (frontend) + `backend/` (API) monorepo layout
- Source code structure: Detailed file tree with React components, FastAPI routers, services, models
- Build/test/deploy architecture defined

**research.md** - Technology decisions (10 sections):
1. Docusaurus 3.x over VitePress/Next.js/MkDocs (battle-tested, React-based, GitHub Pages friendly)
2. sentence-transformers/all-MiniLM-L6-v2 over OpenAI/BAAI/mpnet (80MB, CPU-only, 384-dim, free)
3. Qdrant Community Cloud over Pinecone/Weaviate/Chroma/FAISS (1GB free, <200ms search, managed)
4. Neon PostgreSQL over Supabase/PlanetScale/SQLite (0.5GB+100h/month free, serverless, Postgres-compatible)
5. FastAPI over Flask/Django/Sanic (async, Pydantic, auto-docs, 10K req/s)
6. REST API over GraphQL/gRPC/WebSocket (simple, CORS-friendly, testable)
7. Semantic chunking strategy (512 tokens max, 50 overlap, heading-aware)
8. IP-based rate limiting (10 req/min, slowapi library)
9. GitHub Pages + Railway/Render free tier deployment
10. Minimal observability (structured logs, health checks, UptimeRobot)

**data-model.md** - Entity definitions (6 entities):
- Chapter (source: markdown files, 6 chapters with required sections)
- Section (extracted from H2/H3 headings, hierarchical IDs like "1.2.3")
- ContentChunk (Qdrant vectors + Neon metadata, 384-dim embeddings, 100-512 tokens)
- ChatQuery (Neon logs, IP hashed for privacy, status tracking)
- ChatResponse (answer + sources with confidence scores)
- UserProfile (Phase 2 only, deferred)
- Complete Neon PostgreSQL schema SQL (3 tables, indexes)
- Qdrant collection schema (HNSW config: m=16, ef_construct=100)

**contracts/openapi.yaml** - API specification:
- POST /api/query: Submit question, get answer with sources (200/400/429/500 responses)
- GET /api/health: Service status check (Qdrant, Neon, embedding model)
- Complete request/response schemas (QueryRequest, QueryResponse, ErrorResponse, HealthResponse)
- Rate limiting headers (Retry-After)
- Examples for all endpoints

**contracts/rag-pipeline.md** - RAG implementation details:
- Indexing pipeline (6 steps): Parse markdown → Chunk → Embed → Store Qdrant → Store Neon → Report
- Query pipeline (8 steps): Validate → Rate limit → Embed query → Search Qdrant → Re-rank → Construct answer → Log → Return
- Chunking algorithm (semantic boundaries, 512 tokens max, 50 overlap)
- Re-ranking formula (70% cosine, 20% keyword overlap, 10% recency)
- Performance budgets (indexing <60s, query p95 <2s)
- Error handling matrix (9 scenarios with user messages)

**quickstart.md** - Developer setup guide:
- Prerequisites (Node 18, Python 3.11, Git)
- 10-step setup: Clone → Environment → Backend install → DB init → Model download → Qdrant init → Backend run → Frontend install → Frontend run → Index chapters
- Sample chapter markdown template
- Test commands (pytest, npm test, curl examples)
- Troubleshooting section (8 common issues with solutions)
- Development workflow guidance

**Constitution Compliance**:
✅ All 7 principles satisfied:
- Simplicity: Single static site + API, standard tools
- Content Quality: Chapter template enforced, code testing required
- AI-Native: Semantic chunking, metadata-rich, zero hallucination
- Clean UI: Docusaurus theme, performance budgets, WCAG AA
- Free-Tier: All services free, CPU-only, explicit limits
- Consistency: Automated style checking, enforced template
- Performance: <3min builds, <1.5s FCP, <200KB bundles

**Architecture Highlights**:
- Monorepo: `website/` (Docusaurus) + `backend/` (FastAPI) in single repo
- Deployment: GitHub Pages (frontend), Railway/Render free (backend)
- Data flow: Markdown → Qdrant vectors + Neon metadata → FastAPI → React chatbot UI
- No complexity violations (no justifications needed in Complexity Tracking section)

## Outcome

- ✅ Impact: Complete implementation plan with detailed architecture, technology decisions, data model, API contracts, and developer guide; ready for task breakdown phase
- 🧪 Tests: Constitution Check passed all 7 principles; testing strategy defined in rag-pipeline.md (unit, integration, E2E)
- 📁 Files: Created plan.md, research.md, data-model.md, contracts/openapi.yaml, contracts/rag-pipeline.md, quickstart.md
- 🔁 Next prompts: Run `/sp.tasks textbook-generation` to generate atomic, testable task list organized by user story priority
- 🧠 Reflection: Plan successfully balances ambitious technical scope (RAG chatbot, semantic chunking, multi-service architecture) with aggressive constraints (free-tier, CPU-only, <3min builds). All technology choices justified with alternatives considered. Clear separation between Phase 1 (core textbook + chatbot) and Phase 2 (personalization, translation) prevents scope creep. Ready for granular task breakdown.

## Evaluation notes (flywheel)

- Failure modes observed: None - all planning phases completed successfully
- Graders run and results (PASS/FAIL): PASS - Constitution Check validated all principles, no violations detected, all NEEDS CLARIFICATION items resolved
- Prompt variant (if applicable): N/A (standard /sp.plan execution)
- Next experiment (smallest change to try): Monitor task generation phase to see if plan provides sufficient detail for atomic task creation, or if additional clarification needed on integration points (Docusaurus ↔ FastAPI, Qdrant ↔ Neon)
