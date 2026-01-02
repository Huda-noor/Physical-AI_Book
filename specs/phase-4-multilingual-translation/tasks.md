# Task Breakdown: Phase 4 - Multilingual Content Translation

This document outlines the dependency-ordered tasks for implementing Phase 4.

**Reference Artifacts:**
- [Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [Phase 3 Plan](../phase-3-auth-personalization/plan.md)

---

## 🏗️ Phase 1: Setup (Shared Infrastructure)
Tasks required for basic project setup.

- [ ] **T001: Add Translation Cache Table**
  - Create migration script `003_add_translation.sql` for `translated_chapters` table.
  - Add `preferred_language` column to `user_profiles` table.
  - Set up indexes for efficient cache lookups.
  - *Acceptance*: Tables visible in Neon console with correct schema.

- [ ] **T002: Update Environment Configuration**
  - Add translation-related environment variables to `.env.example`.
  - Update `config.py` Settings model with new vars if needed.
  - *Acceptance*: Environment template includes all necessary variables for translation feature.

---

## 🎯 Phase 2: Core Translation Backend (User Story 1)
Implementation of translation API endpoint and service.

- [ ] **T003: Create Translation Service**
  - Create `backend/app/services/translation_service.py`.
  - Implement code block detection (regex for ``` and `).
  - Build translation prompt for OpenAI GPT-4o-mini.
  - Reuse existing `openai_service.py` client.
  - *Acceptance*: Service generates high-quality translations preserving code blocks.

- [ ] **T004: Create Translation API Endpoint**
  - Create `backend/app/api/translate.py`.
  - Implement `POST /api/translate` endpoint.
  - Parameters: `chapter_id` (int), `target_language` (str).
  - Check Better Auth session via `get_current_user` dependency.
  - Check cache before calling OpenAI.
  - Implement rate limiting: 5 translations per minute per user.
  - *Acceptance*: Endpoint returns translated markdown with cache status.

- [ ] **T005: Add Translation Route to Main App**
  - Update `backend/app/main.py` to include translation router.
  - Register endpoint under `/api` prefix.
  - *Acceptance*: Translation endpoint accessible at `/api/translate`.

---

## 🎯 Phase 3: Translation UI Components (User Story 2)
Frontend components for language selection and translation display.

- [ ] **T006: Create Translation Context**
  - Create `website/src/contexts/TranslationContext.tsx`.
  - Manage state: `currentLanguage`, `isTranslating`, `translationError`, `activeChapterTranslations`.
  - Implement `useTranslation` hook.
  - *Acceptance*: App tracks language preference globally.

- [ ] **T007: Create Translate Button Component**
  - Create `website/src/components/TranslateButton.tsx`.
  - Language dropdown: English (original/revert), Urdu, German, French.
  - Disabled if not authenticated.
  - Show loading state during translation.
  - Display "Translated to [Language]" indicator when active.
  - *Acceptance*: Button integrated into chapter pages.

- [ ] **T008: Create Translation Status Component**
  - Create `website/src/components/TranslationStatus.tsx`.
  - Display loading spinner.
  - Display error messages with retry button.
  - Display success message with language indicator.
  - *Acceptance*: User feedback on translation progress.

- [ ] **T009: Update DocItem Layout Wrapper**
  - Modify `website/src/theme/DocItem/Layout/index.tsx`.
  - Add `TranslateButton` to chapter page.
  - Position button next to `PersonalizeButton`.
  - *Acceptance*: Translation button visible on all chapter pages.

---

## 🎯 Phase 4: Content Replacement & State Management (User Story 3)
Replace chapter content with translated versions and manage language preferences.

- [ ] **T010: Create Translation Service Extension**
  - Add `load_translated_chapter` method to `translation_service.py`.
  - Load original chapter markdown from filesystem.
  - Call OpenAI translation with proper prompt.
  - *Acceptance*: Service handles content loading and translation.

- [ ] **T011: Create Translated Content Component**
  - Create `website/src/components/TranslatedContent.tsx`.
  - Render translated markdown using `react-markdown`.
  - Display "Translated to [Language]" badge.
  - Add "Back to English" button.
  - *Acceptance*: User can switch between English and translated versions.

- [ ] **T012: Integrate Translation Context with Auth**
  - Update `website/src/contexts/TranslationContext.tsx`.
  - Get user ID from `AuthContext`.
  - Fetch user's preferred language from backend profile.
  - Apply default language preference on first visit.
  - *Acceptance*: Translation preferences sync with user profile.

- [ ] **T013: Implement Revert Functionality**
  - Add "Back to English" button to `TranslatedContent`.
  - Reset to original chapter content.
  - Clear translation state in `TranslationContext`.
  - *Acceptance*: User can always return to English.

---

## 🎯 Phase 5: Caching & Optimization (User Story 2 Part B)
Implement translation caching to minimize API costs.

- [ ] **T014: Update Backend with Cache Logic**
  - Modify `translation_service.py` to check cache before calling OpenAI.
  - Query `translated_chapters` table by `(user_id, chapter_id, target_language)`.
  - Return cached version if exists (`is_cached: true`).
  - Set `chapter_version` for cache invalidation.
  - *Acceptance*: Cache-first strategy reduces API calls by 80%+.

- [ ] **T015: Update Frontend Cache Handling**
  - Modify `TranslationContext.tsx` to cache translations.
  - Store translated content in `sessionStorage` per chapter.
  - Check cache before requesting translation.
  - Display cached version instantly (<100ms).
  - *Acceptance*: Repeated page loads are fast.

---

## 🎯 Phase 6: Testing & Quality Assurance (User Story 1 Part B)
Validate translation accuracy, code preservation, and technical term handling.

- [ ] **T016: Test Translation Accuracy**
  - Test translating Chapter 1 to German, French, Urdu.
  - Verify prose is translated, code blocks preserved.
  - Verify technical terms (tensor, gradient, ROS) remain in English.
  - *Criteria*: Code blocks 100% preserved, terminology appropriate.

- [ ] **T017: Test Code Block Preservation**
  - Test translation of chapters with Python, JavaScript, and C++ code.
  - Verify code within ``` fences is NOT translated.
  - Verify code formatting is preserved.
  - *Criteria*: Code unchanged in translations.

- [ ] **T018: Test Markdown Formatting Preservation**
  - Test translation preserves headings (#), lists (-), tables (|).
  - Test translation preserves emphasis (**, __).
  - Test RTL (Urdu) text direction is correct.
  - *Criteria*: Markdown structure intact.

- [ ] **T019: Test Authentication Enforcement**
  - Test translation endpoint returns 401 for unauthenticated users.
  - Test translation works for authenticated users only.
  - Test button is disabled when not logged in.
  - *Criteria*: Auth enforcement works correctly.

- [ ] **T020: Test Rate Limiting**
  - Attempt 6 translations in <60 seconds for same user.
  - Verify 6th request returns HTTP 429.
  - Wait 60 seconds, verify 7th request succeeds.
  - *Criteria*: Rate limiting prevents abuse.

- [ ] **T021: Test Cache Invalidation**
  - Translate chapter to German.
  - Update `preferred_language` in profile to 'de'.
  - Revisit chapter, verify German version loads instantly (cache hit).
  - Update profile to 'en', verify cache still works.
  - *Criteria*: Cache respects language preference.

- [ ] **T022: Test UI Language Toggle**
  - Test switching between English, German, French, Urdu.
  - Verify all languages toggle correctly.
  - Verify language preference persists across page navigation.
  - *Criteria*: Language switching works seamlessly.

---

## ✅ Integration & Final Tests
- [ ] **Testing: Full User Journey**
  - Sign up → Login → Translate Chapter 1 to German → Switch to French → Revert to English
  - Verify each step works correctly and independently testable.
  - *Acceptance*: Complete workflow验证 passes.

- [ ] **Testing: Security Audit**
  - Verify users cannot access other users' translations (try tampering with user_id).
  - Verify session-based authorization prevents unauthorized access.
  - Verify no PII in translation logs.
  - *Acceptance*: Security boundaries enforced.

- [ ] **Testing: Cost Check**
  - Run 10 translations and verify OpenAI dashboard usage.
  - Verify costs match ~$0.05-0.10 per chapter estimate.
  - Monitor cache hit rate improvement.
  - *Acceptance*: Translation costs within budget (<$2/month).

---

## Task Dependencies

### Phase 1 (Setup)
- T001 → T002

### Phase 2 (Core Backend)
- T001 (Setup) → T003 → T004 → T005

### Phase 3 (UI Components)
- T001 (Setup) → T006 → T007 → T008 → T009

### Phase 4 (Content Replacement)
- T001 (Setup) → T006 (UI) → T010 → T011 → T012 → T013

### Phase 5 (Caching)
- T001 (Setup) → T003 (Backend) → T015 (Frontend)

### Phase 6 (Testing)
- T001 (Setup) → T003 (Backend) → T006-T009 (UI) → T010-T013 (Content) → T016-T022 (All tests)

### Final Integration
- All phases complete → Final tests (T023-T025)

---

**Total Tasks**: 25
**Backend Tasks**: 8 (T001-T005, T010, T014)
**Frontend Tasks**: 9 (T006-T009, T011, T013, T015)
**Testing Tasks**: 8 (T016-T022)

---

**Note**: Tasks marked [P] can run in parallel when all dependencies are met. Tests should be written and executed before implementation (if TDD approach).
