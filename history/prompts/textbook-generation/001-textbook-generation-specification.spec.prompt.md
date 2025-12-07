---
id: 001
title: Textbook Generation Feature Specification
stage: spec
date: 2025-12-01
surface: agent
model: claude-sonnet-4-5-20250929
feature: textbook-generation
branch: master
user: DELL
command: /sp.specify
labels: ["specification", "textbook-generation", "rag-chatbot", "docusaurus", "free-tier"]
links:
  spec: specs/textbook-generation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/textbook-generation/spec.md
tests:
  - Constitution compliance validation (manual)
---

## Prompt

/sp.specify

Feature: textbook-generation

Objective:
Define the complete specification for building a short, clean, professional AI-native textbook
based on the Physical AI & Humanoid Robotics course, with a modern Docusaurus UI and a free-tier
compatible RAG chatbot.

Book Structure (Final):
Create exactly 6 short, focused chapters:
1. Introduction to Physical AI
2. Basics of Humanoid Robotics
3. ROS 2 Fundamentals
4. Digital Twin Simulation (Gazebo + Isaac)
5. Vision-Language-Action Systems
6. Capstone: Simple AI-Robot Pipeline

Specification Requirements:
- Each chapter must be concise, structured, and easy to read.
- Writing style must be simple, clean, and professional.
- UI must be minimalistic, beautiful, modern.
- Chapters should not be long; only essential content included.

Technical Requirements:
- Use Docusaurus for the book.
- Auto-generate sidebar, routing, and content structure.
- Build a free-tier compatible RAG chatbot using:
  - Qdrant (vector store)
  - Neon Postgres (metadata)
  - FastAPI backend
  - Lightweight embeddings
- Chatbot must answer only from book content.
- Support text-selection-based Q&A.

Optional Feature Hooks (structure only needed):
- Personalize Chapter button
- Translate to Urdu button
- User background–based adaptation

Constraints:
- Free API usage only.
- Lightweight embeddings required.
- Fast, minimal build.
- No heavy GPU requirements.

Output:
Produce a complete, clean, unambiguous specification for the "textbook-generation" feature.

## Response snapshot

Created comprehensive feature specification (47 functional requirements, 41 NFRs, 33 constraints).

**5 User Stories with Priorities:**
1. **P1 (MVP)**: Read Structured Chapters - Core textbook reading experience with 6 chapters, clean UI, responsive design
2. **P2**: Query Book Content via RAG Chatbot - AI-powered Q&A with source citations, <2s response time
3. **P3**: Select Text and Ask Questions - Context-aware chatbot interaction with highlighted selections
4. **P4**: Personalize Chapter Content - Experience-level adaptation (beginner/intermediate/advanced)
5. **P5**: Translate Chapter to Urdu - Full translation with RTL formatting and bilingual chatbot

**Key Technical Specifications:**
- Static site: Docusaurus 3.x + React 18 + TypeScript
- Backend API: FastAPI + Python 3.11
- Vector DB: Qdrant (384-dim embeddings, MiniLM-L6)
- Metadata: Neon PostgreSQL
- Hosting: GitHub Pages (frontend) + Railway/Render (backend)

**RAG Pipeline:**
- Indexing: Semantic chunking (512 tokens max, 50 overlap), metadata extraction
- Query: Embedding → Vector search (top-k=5) → Re-rank → Cite sources
- Constraint: Answer ONLY from book content, zero hallucination

**Performance Budgets:**
- FCP <1.5s, TTI <3s, LCP <2.5s, CLS <0.1
- Build <3min, API p95 <2s
- Lighthouse >90, WCAG 2.1 AA compliance

**Free-Tier Compliance:**
- Qdrant <1GB, Neon <0.5GB storage + 100h compute/month
- CPU-only embeddings, no GPU
- Rate limit: 10 req/min per IP

**Out of Scope (Phase 1):**
- User authentication, progress tracking
- Dark mode, PDF export, offline PWA
- Interactive exercises, video content
- Admin panel, analytics dashboard

**Constitution Validation:**
✅ All 7 principles satisfied: Simplicity, Content Quality, AI-Native Design, Clean UI, Free-Tier, Consistency, Performance

Specification includes:
- 10+ edge cases with handling strategies
- 6 key entities (Chapter, Section, Content Chunk, Chat Query, Chat Response, User Profile)
- 26 measurable success criteria
- 12 explicit assumptions
- 10 risks with mitigation strategies
- Complete validation checklist

## Outcome

- ✅ Impact: Feature fully specified with clear acceptance criteria, technical constraints, and success metrics; ready for planning phase
- 🧪 Tests: Independent testability defined for each user story; constitution compliance validated manually
- 📁 Files: Created specs/textbook-generation/spec.md (comprehensive specification document)
- 🔁 Next prompts: Run `/sp.plan textbook-generation` to create implementation plan with architecture decisions
- 🧠 Reflection: Specification successfully balances ambitious scope (RAG chatbot, 6 chapters, personalization hooks) with aggressive constraints (free-tier, no GPU, <3min builds). Prioritized user stories enable MVP-first approach (P1 only for initial launch). Clear exclusions prevent scope creep.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification complete and constitutional
- Graders run and results (PASS/FAIL): PASS - All required sections present, user stories prioritized and independently testable, success criteria measurable, constraints explicit
- Prompt variant (if applicable): N/A (standard /sp.specify execution)
- Next experiment (smallest change to try): Monitor planning phase to see if specification provides sufficient detail for architecture decisions or requires clarification on RAG pipeline implementation
