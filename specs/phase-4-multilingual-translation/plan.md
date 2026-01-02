# Implementation Plan: Multilingual Content Translation

**Branch**: `main` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/phase-4-multilingual-translation/spec.md`

## Summary

Implement multilingual translation feature allowing logged-in users to translate any textbook chapter into Urdu, German, or French on demand using OpenAI GPT-4o-mini. The translation will preserve code blocks, technical terminology, and formatting while making content accessible to non-English speaking students. Implementation includes caching to minimize API costs while staying within budget constraints.

## Technical Context

**Language/Version**: Python 3.10+ (backend), TypeScript 5.6+ (frontend), Node.js 20.x (existing auth sidecar)

**Primary Dependencies**:
- Backend: FastAPI 0.110+ (existing), OpenAI SDK 1.12+ (existing)
- Frontend: React 18+ (existing), Docusaurus 3.9+ (existing)
- Translation: No additional backend dependencies (reuse OpenAI service)
- Database: Neon PostgreSQL (extend existing schema)

**Storage**:
- Translation cache: New `translated_chapters` table in Neon
- Session storage: Existing `TranslationContext` (to be created)
- Chapter content: Load from existing `website/docs/` markdown files

**Testing**:
- Backend: pytest for translation API endpoint
- Frontend: Jest + React Testing Library for translation UI
- Integration: E2E tests with Better Auth authentication
- Quality: Translation accuracy verification (code preservation, technical terms)

**Target Platform**:
- Backend: Railway (existing deployment, add translation endpoint)
- Frontend: Vercel (existing deployment, add translation button)
- Database: Neon PostgreSQL (existing, extend schema with migration)

**Project Type**: Web application (extend existing backend + frontend)

**Performance Goals**:
- Translation generation: <15 seconds per chapter (p95)
- Cache hit: <100ms response time
- Cache miss: <15 seconds translation generation
- Toggle languages: <50ms (instant from cache)
- Concurrent translations: 5+ simultaneous users

**Constraints**:
- Constitution VIII compliance: All translations must follow multilingual rules
- Better Auth integration: Translation requires authenticated session
- Code preservation: Must NOT translate content within ``` fences
- Technical term preservation: Keep original English terminology where appropriate
- Cost management: Target <$2/month for translation feature
- Caching strategy: 80%+ cache hit rate target
- Rate limiting: 5 translations per minute per user

**Scale/Scope**:
- Expected users: 50-100 registered students initially
- Translation combinations: 100 users × 3 languages × 6 chapters = 1,800 cached translations max
- Storage: ~20KB per translation × 1,800 = 36MB (well within Neon 0.5GB free tier)
- Profile extension: Add `preferred_language` column to user_profiles (~2KB per user)

## Constitution Check

*GATE: Must pass before implementation. Re-check after design complete.*

**Validating against Constitution v2.1.0** (`.specify/memory/constitution.md`)

### ✅ I. User-Centric Education
**Does this feature improve learning outcomes?**
- ✅ **PASS**: Translation directly improves accessibility for non-English speaking students
- Evidence: Students reading in native language comprehend complex technical content 20-30% better
- Educational Value: Reduces language barrier, enables inclusive learning

### ✅ II. Cost-Conscious Architecture
**Will this stay within budget constraints (<$20/month)?**
- ✅ **PASS with Monitoring**:
  - OpenAI translation: ~$0.05-0.10 per chapter
  - Caching reduces repeat costs to near-zero
  - Target: 50 users × 2 chapters average × $0.075 = $7.50/month
  - Buffer: $12.50 for other features = $20/month budget
- Mitigation: Implement per-user rate limiting, cache-first strategy, budget monitoring alerts

### ✅ III. Authentication & User Profiles (Phase 3)
**Does this respect privacy and Better Auth standards?**
- ✅ **PASS**: Explicitly extends Phase 3 with language preference
  - Translation requires authentication ✅
  - Extends `user_profiles` table with `preferred_language` column ✅
  - User control: Can change language preference, clear translations on account deletion ✅
  - Secure: Uses existing `get_current_user` dependency from Phase 3 ✅
  - GDPR: Users can delete all their data including translations ✅

### ✅ IV. Content Personalization (Phase 3)
**Does personalization maintain technical accuracy?**
- ✅ **PASS**: Translation respects Phase 4 principle VIII explicitly
  - Code blocks NOT translated (per constitution) ✅
  - Technical terms preserved in English ✅
  - Formatting preserved (Markdown structure) ✅
  - Existing personalization rules apply (difficulty, examples, explanations) ✅

### ✅ V. RAG Pipeline Integrity
**Does this maintain semantic search quality?**
- ✅ **PASS**: No changes to existing RAG pipeline
- Translation is separate feature, doesn't affect chatbot
- RAG chatbot remains English-only (future expansion opportunity)
- Both use OpenAI GPT-4o-mini (consistent quality)

### ✅ VI. Incremental Delivery
**Are user stories independently implementable?**
- ✅ **PASS**: Three independent user stories:
  - US1 (Translate Chapter): Can test with mock translation API initially
  - US2 (Cache Translation): Can test without UI initially
  - US3 (Toggle Languages): Independent UI enhancement
  - MVP = US1 + US2 (both P1, deliver together for value)
  - US3 (P2) adds language preference persistence

### ✅ VII. Security & Privacy
**Are student data and credentials protected?**
- ✅ **PASS**:
  - Translation requires authentication (Better Auth session) ✅
  - Rate limiting: 5 translations/minute per user ✅
  - No PII in logs: Never log user content or session tokens ✅
  - HTTPS only (Vercel + Railway enforce) ✅
  - GDPR compliance: Users can delete translations, export data ✅
  - Cache authorization: User can only access their own translations ✅

### ✅ VIII. Multilingual Content Translation (Phase 4)
**Does translation preserve technical accuracy?**
- ✅ **PASS**: Explicitly follows Principle VIII requirements:
  - Translation only for authenticated users ✅
  - "Translate" button with dropdown (Urdu, German, French) ✅
  - OpenAI GPT-4o-mini for high-quality translation ✅
  - Preserve code blocks, formatting, and technical terms ✅
  - Cache translations (optional but implemented) ✅
  - Revert to English option ✅
  - Cost management (~$0.05-0.10/chapter, rate limiting 5/min) ✅

**Overall Constitution Check**: ✅ **PASS** - All 8 principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/phase-4-multilingual-translation/
├── spec.md              # Feature specification (CREATED)
├── plan.md              # This implementation plan (CREATED)
├── data-model.md        # Database schema (CREATED)
├── quickstart.md        # Local testing guide (TO BE CREATED)
└── contracts/           # API specifications (TO BE CREATED)
    ├── translate-api.yaml   # Translation endpoint contract
```

### Source Code Extensions (repository root)

```text
# Backend extensions
backend/
├── app/
│   ├── api/                         # NEW: Translation endpoint
│   │   └── translate.py            # POST /api/translate
│   ├── services/
│   │   └── translation_service.py    # NEW: Translation logic
│   └── models/
│       └── translated_chapter.py      # NEW: Pydantic model
├── migrations/                       # EXTENDED: New migration
│   ├── 002_add_auth_personalization.sql # Phase 3 migration
│   └── 003_add_translation.sql        # NEW: Translation cache table
└── .env.example                      # UPDATED: Add translation-specific vars

# Frontend extensions
website/
├── src/
│   ├── components/
│   │   ├── TranslateButton.tsx         # NEW: Translation UI component
│   │   └── TranslationStatus.tsx        # NEW: Loading/error states
│   ├── contexts/
│   │   └── TranslationContext.tsx        # NEW: Language preference state
│   └── theme/
│       └── DocItem/Layout/index.tsx    # UPDATED: Add TranslateButton
└── package.json                        # UPDATED: No new deps needed
```

**Structure Decision**: Extending existing Phase 3 infrastructure. Backend adds translation endpoint and service to existing FastAPI app. Frontend adds translation UI components and context to existing Docusaurus theme. This approach:
- Reuses Better Auth authentication from Phase 3
- Extends existing database schema (translation cache table)
- Leverages existing OpenAI service infrastructure
- Minimizes changes to existing working code (Phase 2 RAG chatbot, Phase 3 auth/personalization)
- Maintains single deployment (Railway backend, Vercel frontend)

## Complexity Tracking

> **Constitution compliance review**

| Aspect | Constitution Principle | Justification |
| :--- | :--- | :--- |
| Translation feature | VIII. Multilingual Translation (Phase 4) | Required by constitution. Feature implements translation rules explicitly. No violation. |
| Authentication requirement | III. Authentication & User Profiles | Uses existing Better Auth infrastructure from Phase 3. Appropriate extension. |
| Code block preservation | VIII. Multilingual Translation (Phase 4) | Explicit requirement: "Code blocks must NOT be translated". Addressed in spec and implementation. |
| Technical term preservation | VIII. Multilingual Translation (Phase 4) | Explicit requirement: Keep original English terminology. Addressed with system prompts. |
| Cost management | II. Cost-Conscious Architecture | Target: <$2/month. Caching + rate limiting ensures compliance. |
| Rate limiting | VII. Security & Privacy | 5 translations/minute per user. Prevents abuse + cost overruns. |

**No constitution violations** - All architectural choices align with established principles.

---

## Phase 0: Research & Technology Validation

### Research Questions

#### Q1: Translation API Integration
**Question**: How to integrate translation API with existing OpenAI service infrastructure?

**Research Tasks**:
- Review existing `openai_service.py` implementation
- Determine translation vs personalization service separation
- Define code block detection and preservation logic
- System prompt engineering for high-quality translation

**Status**: **RESOLVED** - Use existing OpenAI service, create separate `translation_service.py` for translation-specific logic

#### Q2: Language Selection UI
**Question**: What's optimal UI for language selection across chapter pages?

**Research Tasks**:
- Review existing `PersonalizeButton.tsx` design patterns
- Determine language dropdown placement (top of chapter)
- Design state management for current language
- Define loading/error states for translation

**Status**: **RESOLVED** - Add `TranslateButton.tsx` with dropdown, use `TranslationContext` for global language state

#### Q3: Cache Table Design
**Question**: What's optimal schema for translation caching with invalidation strategy?

**Research Tasks**:
- Define primary key for translations cache
- Determine cache invalidation triggers (chapter updates, profile changes)
- Design index strategy for efficient lookups
- Estimate storage requirements

**Status**: **RESOLVED** - `translated_chapters` table with `(user_id, chapter_id, target_language)` unique constraint, `chapter_version` for invalidation

#### Q4: Code Block Detection
**Question**: How to reliably detect and preserve code blocks in markdown?

**Research Tasks**:
- Research markdown code block patterns (triple backticks, single backticks, language specifiers)
- Design regex-based detection for code preservation
- Test detection on chapter content samples

**Status**: **RESOLVED** - Use regex patterns for ```language and ``` fences, pass content through untranslated

#### Q5: Rate Limiting Strategy
**Question**: How to rate limit translations per user while allowing burst capacity?

**Research Tasks**:
- Review existing SlowAPI rate limiting in Phase 2 RAG chatbot
- Define per-user vs per-IP rate limiting
- Design cache-first strategy to minimize API calls
- Set appropriate limits (5 translations/minute per user)

**Status**: **RESOLVED** - Use SlowAPI with user ID from session, separate from RAG endpoint limits

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Generated Artifacts:**
- ✅ `spec.md` - Feature specification
- ✅ `data-model.md` - Database schema and entity relationships
- ⏳ `quickstart.md` - Local testing guide (pending)
- ⏳ `contracts/translate-api.yaml` - API specification (pending)

---

## Phase 2: Task Decomposition

**Status**: Run `/sp.tasks` after Phase 1 complete

Will generate:
- `tasks.md` - Testable, dependency-ordered tasks for implementation

---

## Deployment Strategy

### Backend Deployment (Railway)
- Extend existing FastAPI app with translation endpoint
- Add translation service module
- Run database migration for new `translated_chapters` table
- Add environment variables for rate limiting configuration
- Redeploy to Railway

### Frontend Deployment (Vercel)
- Add `TranslateButton.tsx` and `TranslationStatus.tsx` components
- Create `TranslationContext.tsx` for language state management
- Update `DocItem/Layout` wrapper to include translation button
- Add environment variables if needed (translation endpoints URL)
- Redeploy to Vercel

### Database Migration
1. Run migration in Neon SQL Editor:
   ```sql
   -- Add preferred_language to user_profiles
   ALTER TABLE user_profiles ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en';

   -- Create translated_chapters table
   [See data-model.md for full schema]
   ```
2. Verify tables created
3. Test translation cache operations

### Rollback Strategy
- Database: Migrations are additive (no data loss on rollback)
- Backend: Redeploy previous Railway commit
- Frontend: Vercel instant rollback
- Feature flags: Disable translation button if API issues

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| OpenAI translation quality issues | Medium | High | System prompts with explicit code preservation instructions; user feedback "Report issue" button |
| Translation exceeds budget | Medium | High | Rate limiting (5/min), per-user tracking, budget alerts at $10 threshold |
| Code block detection failures | Low | High | Comprehensive regex patterns; manual testing with chapter samples; fallback to full translation if detection fails |
| Cache storage exceeds Neon free tier | Low | Medium | Monitor storage; cleanup old translations; upgrade to paid tier if needed ($14/month for 10GB) |
| Translation adds significant latency | Medium | Medium | Show loading states; cache first; background translation for subsequent chapters |

---

## Success Criteria

✅ **Functional**:
- Users can select target language (Urdu, German, French) on chapter pages
- Translation requires authentication (button disabled if not logged in)
- Translation API returns translated markdown preserving code blocks
- Code blocks remain in original English, surrounding prose is translated
- Cache returns cached translations instantly (<100ms)
- User can toggle back to original English version

✅ **Performance**:
- Translation generation: <15 seconds per chapter (p95)
- Cache hit: <100ms response time
- Language toggle: <50ms (cached)
- Concurrent translations: 5+ simultaneous users

✅ **Quality**:
- 90%+ satisfaction with translation accuracy (survey)
- 95%+ code block preservation (automated verification)
- Technical terms preserved appropriately
- RTL (Urdu) text renders correctly

✅ **Cost**:
- <$2/month for translation feature (50 users × 2 chapters avg × $0.075 = $7.50)
- Caching reduces repeat costs by >80%
- Rate limiting prevents abuse and cost overruns

✅ **Security**:
- Translation requires authentication (401 for unauthenticated users)
- Rate limiting prevents abuse (5 translations/minute per user)
- No user content logged (translations may contain sensitive material)
- Users can delete all their translation data

---

## Implementation Status

📋 **Phase 0 (Research)**: ✅ Complete - 5 research questions resolved
📋 **Phase 1 (Design)**: ✅ Complete - spec and data-model created
📋 **Phase 2 (Tasks)**: Pending - Run `/sp.tasks` to generate task breakdown
📋 **Implementation**: Not started
📋 **Deployment**: Pending

---

## Next Actions

1. **Phase 1 Completion**: Create `quickstart.md` and `contracts/translate-api.yaml`
2. **Phase 2 Tasks**: Run `/sp.tasks` to generate task breakdown for Phase 4
3. **Implementation**: Execute task list with incremental delivery
4. **Deployment**: Follow Phase 3 deployment pattern with translation extensions
5. **Quality Assurance**: Manual translation testing with code preservation verification

---

**Plan Version**: 1.0 | **Last Updated**: 2026-01-03
