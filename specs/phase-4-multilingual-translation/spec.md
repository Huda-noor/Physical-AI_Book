# Feature Specification: Multilingual Content Translation

**Feature**: Phase 4 - Multilingual Content Translation
**Date**: 2026-01-03
**Status**: Planning
**Depends On**: Phase 3 - Authentication & Personalization (Complete)

## Overview

Implement multilingual translation feature allowing logged-in users to translate any textbook chapter into Urdu, German, or French on demand using OpenAI GPT-4o-mini. The translation will preserve code blocks, technical terminology, and formatting while making content accessible to non-English speaking students.

## Goals

1. Enable high-quality translation of chapter content into three target languages (Urdu, German, French)
2. Maintain technical accuracy by preserving code blocks and domain-specific terminology
3. Provide instant toggle between original English and translated versions
4. Cache translations to minimize API costs while respecting budget constraints
5. Ensure translation is only available to authenticated users (respects privacy and security)

## Functional Requirements

### FR1: Translation Endpoint
- Implement `POST /api/translate` in FastAPI
- Accept chapter ID and target language as parameters
- Require valid user authentication session
- Preserve code blocks (don't translate content within ``` fences)
- Return translated markdown with metadata (cache status, generation time)

### FR2: Translation UI Component
- Add "Translate" button at top of each chapter page
- Include dropdown for language selection (Urdu, German, French, English/original)
- Button disabled if user is not logged in
- Show loading state during translation API call
- Display "Translated to [Language]" indicator when active

### FR3: Content Replacement Engine
- Replace chapter content with translated markdown
- Use `react-markdown` to render translated content
- Maintain Docusaurus styling and layout
- Provide "Back to English" button to revert to original

### FR4: Translation Caching (Optional Bonus)
- Store translations in `translated_chapters` table
- Cache key: `(user_id, chapter_id, target_language)`
- Check cache before calling OpenAI API
- Return cached version if available (with `is_cached: true` flag)
- Invalidate cache if original chapter content changes (chapter version tracking)

### FR5: Language Selection State
- Persist current language preference per user per chapter
- Default to English on first visit
- Remember last selected language across page navigation
- Clear translation state when signing out

## Non-Functional Requirements

### Performance
- Translation generation: <15 seconds per chapter (p95)
- Cache hit: <100ms response time
- Toggle English/Translated: Instant (<50ms)

### Reliability
- Translation API: 99.5% uptime (OpenAI SLA)
- Graceful fallback: If OpenAI fails, show error with retry button
- Error messages: Clear, actionable (e.g., "Translation service unavailable. Please try again.")

### Security
- Authentication required: Verify Better Auth session before allowing translation
- Rate limiting: 5 translations per minute per user
- No PII in logs: Never log user content or session tokens
- HTTPS only: All API calls over HTTPS

### Cost
- OpenAI translation cost: ~$0.05-0.10 per chapter (based on token count)
- Caching reduces repeat costs to near-zero
- Target: <$2/month for translation feature (50 users × 2 chapters average)
- Budget monitoring: Include translation costs in overall budget tracking

### Quality
- Code preservation: Must NOT translate code within ``` fences
- Technical terminology: Keep original English terms where appropriate (e.g., "tensor", "gradient descent")
- Formatting: Preserve Markdown structure (headings, lists, tables, code blocks)
- Context: Target language should sound natural to native speakers

## User Stories

### US1: Translate Chapter to Target Language (Priority: P1) 🎯 MVP
**As a** logged-in student who speaks German
**I want to** translate Chapter 1 into German
**So that** I can read the content in my native language

**Acceptance Criteria:**
- User is logged in and viewing Chapter 1
- User clicks "Translate" dropdown, selects "German"
- System shows "Translating..." loading state
- System calls `/api/translate` with chapter_id=1, language="de"
- OpenAI generates German translation (preserves code blocks, technical terms)
- System displays translated content with "Translated to German" indicator
- User can click "Back to English" to revert
- Translation completes within 15 seconds
- Chapter navigation (e.g., to Chapter 2) remembers translation preference

### US2: Cache Translation for Repeat Access (Priority: P2)
**As a** logged-in student who frequently reads Chapter 3 in Urdu
**I want to** see cached Urdu translation instantly on repeat visits
**So that** I don't wait for translation generation every time

**Acceptance Criteria:**
- User translates Chapter 3 to Urdu (first time: 10-15 seconds)
- Translation cached in `translated_chapters` table
- User navigates away, returns to Chapter 3 later
- System detects cached Urdu version, displays instantly (<100ms)
- User updates their profile (invalidates cache)
- Next visit shows "Translating..." again (10-15 seconds) with new cache

### US3: Toggle Between Languages (Priority: P2)
**As a** logged-in student comparing translations
**I want to** quickly switch between English, German, and French versions
**So that** I can cross-reference technical content

**Acceptance Criteria:**
- User currently viewing German translation of Chapter 2
- User clicks "Translate" dropdown, selects "French"
- System displays French translation (cached if available, else generate)
- User clicks "Back to English"
- System instantly (<50ms) shows original English content
- All toggles preserve scroll position within reasonable bounds

## Technical Stack

### Backend Extensions
- **FastAPI**: Add `translate.py` API endpoint
- **OpenAI**: GPT-4o-mini for translation (reusing existing service)
- **Database**: Extend Neon PostgreSQL schema

### Frontend Extensions
- **React**: Create `TranslateButton` component
- **Context**: Extend `TranslationContext` for language state
- **Docusaurus**: Integrate button into `DocItem/Layout` wrapper

### Database Schema Extensions

```sql
-- Translations Table (Cache)
CREATE TABLE translated_chapters (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    chapter_id INTEGER NOT NULL,
    target_language VARCHAR(10) NOT NULL,  -- 'ur', 'de', 'fr', 'en'
    translated_content TEXT NOT NULL,
    chapter_version INTEGER DEFAULT 1,  -- For cache invalidation
    is_cached BOOLEAN DEFAULT TRUE,  -- False for fresh translations
    generation_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, chapter_id, target_language),
    CONSTRAINT fk_translated_chapters_user_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_translations_lookup
ON translated_chapters(user_id, chapter_id, target_language);
```

## Architecture

```
┌─────────────────────────────────────────┐
│         User (Browser)                │
└──────────────┬────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Frontend (Vercel - Docusaurus)    │
│  ┌────────────────────────────────┐    │
│  │ Translation UI               │    │
│  │  ├─ TranslateButton            │    │
│  │  ├─ Language Dropdown         │    │
│  │  ├─ Back to English          │    │
│  │  └─ Loading/Error States      │    │
│  └────────────────────────────────┘    │
└──────────────┬────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Backend (Railway - FastAPI)           │
│  ┌────────────────────────────────┐    │
│  │  POST /api/translate         │    │
│  │  1. Check cache (Neon)      │    │
│  │  2. If miss: Call OpenAI      │    │
│  │  3. Save to cache           │    │
│  │  4. Return translation        │    │
│  └────────────────────────────────┘    │
└──────────────┬────────────────────────┘
               │
      ┌────────┴──────────┐
      ↓                 ↓
┌──────────┐    ┌──────────┐
│   Neon   │    │  OpenAI   │
│PostgreSQL │    │   API     │
│ (Cache)   │    │           │
└──────────┘    └──────────┘
```

## Out of Scope (Phase 4)

- Auto-detection of user's preferred language (user must manually select)
- Support for additional languages beyond Urdu, German, French (future phases)
- Translation of RAG chatbot responses (Phase 5)
- Translation of signup/profile pages (Phase 5)
- Real-time translation as user types (only chapter-level translation)
- Audio/speech synthesis (read-aloud feature)
- Offline translation capabilities (requires local model)

## Success Metrics

1. **Adoption**: 60%+ of logged-in users use translation at least once
2. **Quality**: 90%+ satisfaction with translation accuracy (survey)
3. **Performance**: 95%+ of translations complete within 15 seconds
4. **Cost**: <$2/month for 50 active users with average 2 chapters translated
5. **Cache Hit Rate**: 80%+ of repeat access hits cache (after initial translation)

## Translation Quality Guidelines

### Code Block Preservation
- **Rule**: Content within triple backticks (```) or triple backticks with language specifier (```python, ```bash) MUST NOT be translated
- **Detection**: Use regex to identify code fences in markdown
- **Handling**: Pass code blocks through unchanged, translate only prose

### Technical Terminology
- **Rule**: Keep specific domain terms in English when they lack natural equivalents
- **Examples**:
  - "tensor" → Keep as "tensor" (not translate to German "Tensor")
  - "gradient descent" → Keep as "gradient descent" (not translate)
  - "Neural network" → Keep as "neural network" (standard term)
  - "Robot Operating System (ROS)" → Keep as "ROS"
- **Rationale**: Students need to recognize these terms in all languages

### Formatting Preservation
- **Rule**: Preserve Markdown structure (headings, lists, tables, emphasis)
- **Detection**: Identify and protect Markdown syntax characters (#, -, *, |, etc.)
- **Handling**: Translate content between syntax markers, keep markers intact

### Language-Specific Adaptations

#### German (de)
- Use formal academic German ("Sie" not "du")
- Compound words: Keep technical terms unhyphenated
- Sentence structure: Slightly longer sentences acceptable

#### French (fr)
- Use formal French ("vous" not "tu")
- Technical terms: Often keep English loanwords (e.g., "le computer")
- Gender agreement: Respect French noun/adjective gender

#### Urdu (ur)
- Use right-to-left (RTL) text direction
- Script: Ensure proper Urdu font rendering (Nastaliq or similar)
- Technical terms: Transliterate where Urdu equivalent doesn't exist

## Cost Estimates

### OpenAI Translation Costs
- GPT-4o-mini: $0.15 per 1M input tokens + $0.60 per 1M output tokens
- Average chapter: ~10,000 tokens (input) + ~8,000 tokens (output)
- Per chapter: ~$0.05-0.10

### Caching Impact
- Without caching: 50 users × 2 chapters × $0.10 = $10/month
- With 80% cache hit: 50 users × 0.4 new translations × $0.10 = $2/month
- **Savings**: $8/month (80% reduction)

### Budget Allocation
- Total monthly target: <$20/month
  - Phase 2 RAG: ~$5/month
  - Phase 3 Personalization: ~$10/month
  - Phase 4 Translation: ~$2/month
  - Buffer: $3/month

## Security & Privacy

### Authentication Enforcement
- Verify Better Auth session token before processing translation request
- Return 401 Unauthorized if no valid session
- Include user_id in translation cache for authorization checks

### Rate Limiting
- Limit: 5 translations per minute per user
- Response: HTTP 429 Too Many Requests with `Retry-After` header
- Prevent API abuse and control costs

### Data Privacy
- No PII in translation logs
- User content not stored in training data (OpenAI policy)
- Clear translation cache on account deletion
- Users can delete all their translations on request (GDPR)

---

**Spec Version**: 1.0 | **Created**: 2026-01-03
