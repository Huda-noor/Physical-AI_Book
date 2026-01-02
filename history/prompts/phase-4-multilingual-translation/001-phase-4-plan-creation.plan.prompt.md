---
id: 001
title: Phase 4 Plan Creation
stage: plan
date: 2026-01-03
surface: agent
model: claude-sonnet-4.5
feature: phase-4-multilingual-translation
branch: main
user: user
command: sp.plan (Phase 4)

Add /translate endpoint in backend.
Create Translate button component.
Support language selection.
Replace chapter content with translated version.
Add "Back to English" button.

labels: ["plan", "phase-4", "translation", "multilingual"]
links:
  spec: ../phase-4-multilingual-translation/spec.md
  data-model: ../phase-4-multilingual-translation/data-model.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/phase-4-multilingual-translation/spec.md
  - specs/phase-4-multilingual-translation/plan.md
  - specs/phase-4-multilingual-translation/data-model.md
  - .specify/memory/constitution.md
tests:
  - Constitution compliance validation
  - Research questions resolution (Q1-Q5)
  - Architecture design
---

## Prompt

sp.plan (Phase 4)

Add /translate endpoint in backend.
Create Translate button component.
Support language selection.
Replace chapter content with translated version.
Add "Back to English" button.

## Response snapshot

Successfully created comprehensive implementation plan for Phase 4 - Multilingual Content Translation feature.

**Plan Structure:**
- ✅ Technical Context: Python 3.10+ backend, TypeScript 5.6+ frontend, Node.js 20.x for auth
- ✅ Constitution Check: All 8 principles validated (I-VIII)
  - NEW: Principle VIII (Multilingual Translation) explicitly passed
- ✅ Project Structure: Documented backend and frontend extensions
- ✅ Phase 0 Research: 5 research questions resolved (API integration, UI design, cache design, code block detection, rate limiting)
- ✅ Risk Analysis: 6 risks identified with mitigation strategies
- ✅ Success Criteria: Functional, Performance, Quality, Cost, Security metrics defined

**Technical Design Decisions:**
1. **Translation API**: Extend existing FastAPI app with `/api/translate` endpoint, reuse OpenAI service
2. **Caching Strategy**: New `translated_chapters` table with cache key `(user_id, chapter_id, target_language)`
3. **Code Preservation**: Regex-based detection for ``` fences, system prompts explicitly instruct to preserve code
4. **Rate Limiting**: 5 translations/minute per user (separate from Phase 3 personalization rate limits)
5. **UI Integration**: `TranslateButton.tsx` with language dropdown, integrated into `DocItem/Layout` wrapper
6. **Language State**: `TranslationContext.tsx` for managing per-user, per-chapter language preferences

**Database Extensions:**
- Add `preferred_language VARCHAR(10)` column to `user_profiles` table
- Create `translated_chapters` table for caching
- Unique constraint on `(user_id, chapter_id, target_language)`
- Indexes for efficient cache lookups

**Cost Budget Allocation:**
- Phase 2 (RAG): ~$5/month
- Phase 3 (Personalization): ~$10/month
- Phase 4 (Translation): ~$2/month
- **Total**: ~$17/month (within $20/month constitution limit)

**Project Type**: Web application extension (add translation to existing authentication/personalization infrastructure)

## Outcome

- ✅ Impact: High - Plan provides complete roadmap for implementing multilingual translation feature that aligns with all 8 constitution principles. Extends Phase 3 infrastructure (authentication) by adding translation capability for 3 target languages (Urdu, German, French).
- 🧪 Tests: Constitution compliance validation passed (all 8 principles). Technical design decisions documented with clear justifications.
- 📁 Files: Created 3 new specification documents (spec.md, data-model.md, plan.md) + updated constitution.md. Total 4 files.
- 🔁 Next prompts: Run `/sp.tasks` for Phase 4 to generate task breakdown. Implement translation backend endpoint and frontend UI components.
- 🧠 Reflection: Constitution Principle VIII (Multilingual Translation) added successfully. Translation feature designed as extension of Phase 3 authentication - leverages existing `get_current_user` dependency, OpenAI service, and Neon database. Caching strategy keeps costs low (~$2/month for 50 users). Code preservation rule critical for technical accuracy. Separation of translation service from personalization service prevents architectural coupling.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan generation completed successfully with all research questions resolved and constitution compliance validated
- Graders run and results (PASS/FAIL): PASS - All 8 constitution principles satisfied, technical design complete, risk analysis thorough
- Prompt variant (if applicable): N/A (standard sp.plan command)
- Next experiment (smallest change to try): Run `/sp.tasks` for Phase 4 to generate dependency-ordered task breakdown. Then implement Phase 4 following TDD approach.
