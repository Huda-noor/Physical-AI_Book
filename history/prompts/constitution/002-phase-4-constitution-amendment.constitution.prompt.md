---
id: 002
title: Phase 4 Constitution Amendment
stage: constitution
date: 2026-01-03
surface: agent
model: claude-sonnet-4.5
feature: none
branch: main
user: user
command: sp.constitution
labels: ["constitution", "governance", "translation", "phase-4", "multilingual"]
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

(Phase 4 Rules & Guidelines)
Objective: Add translation feature for logged-in users to translate any chapter into Urdu, German, or French on demand.
Core Rules:

Translation only for logged-in users.
Add "Translate" button with dropdown (Urdu, German, French) at top of each chapter.
Use OpenAI GPT-4o for high-quality translation.
Preserve code blocks, formatting, and technical terms.
Cache translations if possible (optional for bonus).
Revert to English option.

## Response snapshot

Successfully amended constitution from version 2.0.0 to 2.1.0 by adding Principle VIII: Multilingual Content Translation (Phase 4).

**Constitution Update Summary:**

Added new core principle:
- **VIII. Multilingual Content Translation (Phase 4)**: Add translation feature for logged-in users
  - Translation only for authenticated users
  - "Translate" button with language dropdown (Urdu, German, French)
  - Use OpenAI GPT-4o-mini for high-quality translation
  - Preserve code blocks, formatting, and technical terms
  - Cache translations in `translated_chapters` table (optional bonus)
  - Revert to English option
  - Rate limiting: 5 translations per minute per user
  - Cost: ~$0.05-0.10 per chapter

**Version Bump Rationale:**
- 2.0.0 → 2.1.0 (MINOR version bump)
- New principle/section added without breaking existing governance rules
- Materially expanded guidance to cover Phase 4 multilingual translation requirements

**Template Verification:**
- ✅ `.specify/templates/plan-template.md` - Contains Constitution Check section that will dynamically validate against all 8 principles
- ✅ `.specify/templates/spec-template.md` - Template supports new feature specifications
- ⚠ `.specify/templates/tasks-template.md` - Should add translation task categories when Phase 4 spec is created
- ✅ `.specify/templates/phr-template.prompt.md` - Already supports new principles

**Governance Compliance:**
- All placeholder tokens replaced with concrete values
- No remaining bracket tokens in constitution
- Version and dates correctly formatted (ISO format)
- All 8 principles are declarative, testable, and specific (no vague "should" language)
- Sync Impact Report included at top of file
- Compliance Review checklist updated to include Principle VIII

**Follow-up TODOs:**
- Run `/sp.specify` for Phase 4 to create translation feature specification
- Validate Phase 4 plan against Principle VIII when generated
- Add translation-specific task categories during Phase 4 task breakdown

## Outcome

- ✅ Impact: Constitution now includes Principle VIII establishing governance for Phase 4 multilingual translation feature. Translation rules codified: authenticated users only, 3 target languages (Urdu, German, French), preserve technical accuracy, optional caching, cost monitoring (~$0.05-0.10/chapter).
- 🧪 Tests: No tests for governance documentation. Constitution defines validation requirements for Phase 4 plan (Principle VIII check).
- 📁 Files: Updated `.specify/memory/constitution.md` with new Principle VIII, updated compliance checklist to include multilingual translation validation.
- 🔁 Next prompts: Run `/sp.specify` for Phase 4 to create translation feature specification. Run `/sp.plan` for Phase 4 to generate architecture plan with Principle VIII constitution compliance check.
- 🧠 Reflection: MINOR version bump appropriate - adding new principle without breaking existing governance. Phase 4 builds on Phase 3 infrastructure (authentication) by adding translation capability for logged-in users. Translation rules align with existing principles (Cost-Conscious: budget monitoring, Security & Privacy: authenticated access only).

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution successfully amended with Principle VIII added, all placeholders filled, version bumped correctly
- Graders run and results (PASS/FAIL): PASS - All 8 principles clear and testable, no bracket placeholders remaining, version/dates correct (v2.1.0, ratified 2025-01-01, amended 2026-01-03), sync impact report included
- Prompt variant (if applicable): N/A (standard sp.constitution command)
- Next experiment (smallest change to try): Run sp.specify for Phase 4 to create multilingual translation feature specification that validates against new Principle VIII
