# Feature Specification: Textbook Generation

**Feature Branch**: `001-textbook-generation`
**Created**: 2025-12-01
**Status**: Draft
**Input**: User description: "Build a short, clean, professional AI-native textbook based on the Physical AI & Humanoid Robotics course, with a modern Docusaurus UI and a free-tier compatible RAG chatbot."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read Structured Chapters (Priority: P1) 🎯 MVP

A learner visits the textbook website to understand Physical AI and Humanoid Robotics concepts through well-structured, easy-to-read chapters.

**Why this priority**: Core value proposition - without readable chapters, there's no textbook. This is the foundation for all other features.

**Independent Test**: Navigate to any chapter URL, verify content loads with proper formatting, headings, code blocks, and images. All 6 chapters must be accessible and readable without any chatbot or interactive features.

**Acceptance Scenarios**:

1. **Given** learner opens the textbook homepage, **When** they view the landing page, **Then** they see a clean, modern interface with a sidebar listing all 6 chapters and an introduction to the book
2. **Given** learner clicks on "Chapter 1: Introduction to Physical AI", **When** the chapter loads, **Then** they see Learning Objectives, Introduction, Core Concepts, Practical Application, Summary, and Further Reading sections in order
3. **Given** learner is reading Chapter 3 (ROS 2 Fundamentals), **When** they scroll through the content, **Then** all code examples display with syntax highlighting, images load with captions, and the page loads in <2 seconds
4. **Given** learner uses mobile device, **When** they access any chapter, **Then** content is fully responsive, readable, and navigation works smoothly
5. **Given** learner browses multiple chapters, **When** they click between chapters, **Then** sidebar highlights current chapter and navigation is instant (<500ms)

---

### User Story 2 - Query Book Content via RAG Chatbot (Priority: P2)

A learner wants to ask specific questions about concepts covered in the textbook and receive accurate, sourced answers directly from the book content.

**Why this priority**: Differentiating AI-native feature that enhances learning experience. Depends on P1 (chapters must exist to query them).

**Independent Test**: With chapters deployed, open chatbot interface, ask "What is Physical AI?", verify it returns an answer with citations to Chapter 1. Test works even if text-selection feature isn't implemented yet.

**Acceptance Scenarios**:

1. **Given** learner opens any chapter page, **When** they click the chatbot icon, **Then** a chat interface opens with a prompt "Ask me anything about the textbook content"
2. **Given** learner types "What are the main components of ROS 2?", **When** they submit the question, **Then** chatbot returns an answer within 2 seconds with citations like "Source: Chapter 3, Section: ROS 2 Architecture"
3. **Given** learner asks a question not covered in the book like "How do I buy a robot?", **When** chatbot processes it, **Then** it responds "I can only answer questions based on this textbook's content. That topic isn't covered here."
4. **Given** learner asks multiple questions in sequence, **When** each question is submitted, **Then** chat history is preserved and previous Q&As remain visible
5. **Given** learner clicks a source citation in chatbot response, **When** link is followed, **Then** they navigate directly to the relevant chapter section

---

### User Story 3 - Select Text and Ask Questions (Priority: P3)

A learner wants to highlight specific text in a chapter and ask contextual questions about that exact content for deeper understanding.

**Why this priority**: Enhanced UX feature that improves engagement. Depends on P1 (content) and P2 (chatbot infrastructure).

**Independent Test**: Select a paragraph about "digital twins" in Chapter 4, click "Ask AI" button, verify chatbot opens with the selected text as context and allows follow-up questions.

**Acceptance Scenarios**:

1. **Given** learner is reading a chapter, **When** they select any text (minimum 10 characters), **Then** a floating "Ask AI" button appears near the selection
2. **Given** learner has selected text about "actuators in humanoid robotics", **When** they click "Ask AI", **Then** chatbot opens with the selected text highlighted and a prompt "Ask a question about this selection"
3. **Given** learner asks "Can you explain this in simpler terms?", **When** chatbot processes the query, **Then** it provides a simplified explanation using the selected text as context with proper source citation
4. **Given** learner selects text across multiple paragraphs, **When** selection exceeds 500 words, **Then** system truncates to last 500 words and shows a notice "Using last 500 words as context"

---

### User Story 4 - Personalize Chapter Content (Priority: P4)

A learner with specific background (beginner/intermediate/advanced) wants to see chapter content adapted to their experience level for better comprehension.

**Why this priority**: Future enhancement for personalization. Requires significant content generation infrastructure. Can be added incrementally after core textbook is stable.

**Independent Test**: Set user profile to "beginner", open Chapter 5 (VLA Systems), click "Personalize for Me" button, verify content adjusts complexity level while maintaining core concepts. Test works independently on any single chapter.

**Acceptance Scenarios**:

1. **Given** learner sets profile to "beginner", **When** they click "Personalize Chapter" on Chapter 5, **Then** technical jargon is replaced with simpler terms, additional explanatory sentences are added, and complex diagrams show tooltips
2. **Given** learner sets profile to "advanced", **When** they view the same chapter, **Then** content includes deeper technical details, assumes prerequisite knowledge, and shows advanced code examples
3. **Given** learner personalizes a chapter, **When** they navigate away and return, **Then** personalized version persists for the session (not permanently modified)

---

### User Story 5 - Translate Chapter to Urdu (Priority: P5)

A learner who prefers reading in Urdu wants to view any chapter in their native language while maintaining all formatting, code examples, and technical accuracy.

**Why this priority**: Accessibility feature for specific audience. Requires translation infrastructure, separate vector index, and significant validation. Can be Phase 2.

**Independent Test**: Open Chapter 2, click "Translate to Urdu" button, verify entire chapter content (except code blocks) displays in Urdu with proper RTL formatting. Chatbot can answer Urdu queries about that chapter.

**Acceptance Scenarios**:

1. **Given** learner clicks "Translate to Urdu" button on any chapter, **When** translation loads, **Then** all text content displays in Urdu with right-to-left formatting, while code blocks remain in English
2. **Given** learner views Urdu chapter, **When** they open chatbot and ask a question in Urdu, **Then** chatbot responds in Urdu with citations to the Urdu chapter sections
3. **Given** learner switches between English and Urdu, **When** language toggle is clicked, **Then** transition happens within 1 second and scroll position is preserved

---

### Edge Cases

- **What happens when chatbot query times out?** System displays "Request timed out. Please try a shorter question or rephrase." and logs the error for monitoring.
- **What happens when user asks extremely long questions (>1000 characters)?** System truncates to 1000 chars and shows warning "Question truncated to 1000 characters for processing."
- **What happens when vector database is unreachable?** Chatbot shows graceful error: "Chatbot temporarily unavailable. Content is still accessible for reading." Site remains functional.
- **What happens when user selects text across multiple chapters (browser bug)?** System uses only text from the current chapter and ignores cross-chapter selections.
- **What happens when embedding model fails to load?** Backend returns error response; frontend shows user-friendly message and allows retry.
- **What happens when rate limit is exceeded (10 req/min)?** API returns 429 status; frontend shows "Please wait before asking another question" with countdown timer.
- **What happens when chapter markdown has syntax errors?** Build fails with clear error message indicating which file and line number has the issue.
- **What happens when images fail to load?** Alt text displays; broken image doesn't break page layout.
- **What happens when user has JavaScript disabled?** Static content remains readable; chatbot and interactive features show message "JavaScript required for interactive features."
- **What happens when mobile keyboard covers chatbot input?** UI automatically scrolls to keep input field visible above keyboard.

## Requirements *(mandatory)*

### Functional Requirements

#### Content Generation & Structure

- **FR-001**: System MUST generate exactly 6 chapters with consistent structure (Learning Objectives, Introduction, Core Concepts, Practical Application, Summary, Further Reading)
- **FR-002**: Each chapter MUST follow the chapter template defined in constitution.md (.specify/memory/constitution.md:92-117)
- **FR-003**: System MUST support markdown formatting including code blocks with syntax highlighting, images with alt text, tables, and lists
- **FR-004**: System MUST auto-generate sidebar navigation listing all chapters with nested section headings (up to 3 levels deep)
- **FR-005**: System MUST generate SEO-friendly URLs in format `/chapter-N-slug` (e.g., `/chapter-1-introduction-to-physical-ai`)
- **FR-006**: Landing page MUST display book title, brief description, table of contents with links to all chapters, and "Get Started" call-to-action

#### Static Site Generation

- **FR-007**: System MUST build complete static site using Docusaurus 3.x with React 18+
- **FR-008**: Build process MUST complete in <3 minutes for full build, <30 seconds for incremental updates
- **FR-009**: Generated site MUST be deployable to GitHub Pages with single command
- **FR-010**: Site MUST work without JavaScript for core reading functionality (progressive enhancement)
- **FR-011**: System MUST generate responsive layouts that work on mobile (320px+), tablet (768px+), and desktop (1024px+)
- **FR-012**: All pages MUST achieve Lighthouse score >90 (performance, accessibility, best practices, SEO)

#### RAG Chatbot - Indexing

- **FR-013**: System MUST parse all chapter markdown files and extract content with metadata (chapter number, section title, heading level)
- **FR-014**: System MUST chunk content intelligently at semantic boundaries (headings, paragraphs) with max 512 tokens per chunk and 50-token overlap
- **FR-015**: System MUST generate embeddings using sentence-transformers/all-MiniLM-L6-v2 (384 dimensions) or BAAI/bge-small-en-v1.5
- **FR-016**: System MUST store vectors in Qdrant with metadata fields: chapter_id, chapter_title, section_title, page_number, content_type (text/code/table)
- **FR-017**: System MUST store chunk metadata in Neon PostgreSQL including: chunk_id, source_file, created_at, updated_at, token_count
- **FR-018**: Indexing pipeline MUST be idempotent (re-running produces same results) and support incremental updates (only re-index changed chapters)

#### RAG Chatbot - Query & Response

- **FR-019**: System MUST expose FastAPI endpoint `POST /api/query` accepting JSON: `{"question": string, "context": optional string, "max_results": optional int}`
- **FR-020**: System MUST generate query embedding and perform semantic search in Qdrant returning top-k=5 most relevant chunks
- **FR-021**: System MUST re-rank results by relevance score and return top 3 chunks with confidence scores
- **FR-022**: System MUST construct response with exact source citations in format: `{"chapter": "3", "section": "ROS 2 Nodes", "page": 45}`
- **FR-023**: System MUST enforce constraint: answer ONLY from book content, never use external knowledge or make assumptions
- **FR-024**: System MUST respond within 2 seconds (p95 latency) or return timeout error
- **FR-025**: System MUST handle concurrent requests up to 100 simultaneous users without degradation

#### RAG Chatbot - UI Integration

- **FR-026**: System MUST display floating chatbot icon on all chapter pages (bottom-right corner, 60x60px, accessible via keyboard)
- **FR-027**: Clicking chatbot icon MUST open modal with chat interface (600x400px, responsive, with close button)
- **FR-028**: Chat interface MUST show user message on right (blue background), bot response on left (gray background), with timestamp
- **FR-029**: System MUST display "Typing..." indicator while waiting for response
- **FR-030**: System MUST render source citations as clickable links that navigate to the exact chapter section
- **FR-031**: System MUST preserve chat history for current session (cleared on page reload or explicit user action)

#### Text Selection & Context

- **FR-032**: System MUST detect text selection events on chapter content (minimum 10 characters, maximum 500 words)
- **FR-033**: System MUST display "Ask AI" floating button near selection (positioned 10px above selection end)
- **FR-034**: Clicking "Ask AI" MUST open chatbot with selected text pre-filled as context
- **FR-035**: System MUST highlight selected text in chatbot context area with light yellow background
- **FR-036**: System MUST allow follow-up questions using the same selected text as persistent context until user clears it

#### Rate Limiting & Security

- **FR-037**: System MUST enforce rate limit of 10 requests per minute per IP address on `/api/query` endpoint
- **FR-038**: System MUST sanitize all user input to prevent XSS, SQL injection, and prompt injection attacks
- **FR-039**: System MUST validate query length (min 3 chars, max 1000 chars) and return 400 error for invalid requests
- **FR-040**: System MUST store API keys in environment variables only (`.env` file, never committed to Git)
- **FR-041**: System MUST enforce CORS policy allowing requests only from configured frontend domains
- **FR-042**: System MUST log all queries with timestamp, IP, question (hashed for privacy), and response time for monitoring

#### Error Handling & Monitoring

- **FR-043**: System MUST display user-friendly error messages for all failure scenarios (network error, timeout, invalid input, service unavailable)
- **FR-044**: System MUST implement retry logic with exponential backoff for transient failures (max 3 retries)
- **FR-045**: System MUST log all errors to console/file with severity level (ERROR, WARNING, INFO) and stack traces
- **FR-046**: Chatbot MUST gracefully degrade when backend is unavailable (show error message, allow content reading)
- **FR-047**: System MUST implement health check endpoint `GET /api/health` returning service status (Qdrant, Neon, API)

### Key Entities

#### Chapter
- **Represents**: Single learning module in the textbook
- **Key Attributes**:
  - `id` (integer, 1-6)
  - `title` (string, e.g., "Introduction to Physical AI")
  - `slug` (string, URL-safe, e.g., "introduction-to-physical-ai")
  - `content` (markdown string)
  - `metadata` (object: author, date, reading_time, difficulty_level)
  - `sections` (array of Section objects)
- **Relationships**: Contains multiple Sections; belongs to Book

#### Section
- **Represents**: Major content division within a chapter (e.g., "Core Concepts", "Practical Application")
- **Key Attributes**:
  - `id` (string, hierarchical like "1.2.1")
  - `title` (string)
  - `heading_level` (integer, 2-4)
  - `content` (markdown string)
  - `parent_chapter_id` (integer)
- **Relationships**: Belongs to Chapter; may contain Subsections

#### Content Chunk
- **Represents**: Semantic unit of content for RAG indexing (paragraph, code block, or logical group)
- **Key Attributes**:
  - `chunk_id` (UUID)
  - `chapter_id` (integer)
  - `section_id` (string)
  - `content` (plain text, no markdown)
  - `token_count` (integer)
  - `embedding` (float array, 384 dimensions)
  - `metadata` (JSON: chapter_title, section_title, content_type, page_number)
  - `created_at` (timestamp)
- **Relationships**: Belongs to Chapter and Section; stored in Qdrant (vectors) and Neon (metadata)

#### Chat Query
- **Represents**: User question submitted to RAG chatbot
- **Key Attributes**:
  - `query_id` (UUID)
  - `user_ip_hash` (string, SHA256)
  - `question` (string, sanitized)
  - `context` (optional string, selected text)
  - `embedding` (float array, 384 dimensions)
  - `retrieved_chunks` (array of chunk_ids)
  - `response` (string)
  - `confidence_score` (float, 0-1)
  - `response_time_ms` (integer)
  - `timestamp` (ISO 8601)
- **Relationships**: References multiple Content Chunks; logged to Neon for analytics

#### Chat Response
- **Represents**: Answer returned by chatbot with source attribution
- **Key Attributes**:
  - `response_id` (UUID)
  - `query_id` (UUID, foreign key)
  - `answer` (string)
  - `sources` (array of objects: `{chapter, section, page, confidence}`)
  - `confidence` (float, 0-1, average of chunk confidences)
  - `generated_at` (timestamp)
- **Relationships**: Belongs to Chat Query; references Content Chunks via sources array

#### User Profile (Optional - Phase 2)
- **Represents**: Learner preferences and progress tracking
- **Key Attributes**:
  - `user_id` (UUID)
  - `experience_level` (enum: beginner, intermediate, advanced)
  - `preferred_language` (enum: english, urdu)
  - `bookmarks` (array of chapter_id + section_id pairs)
  - `reading_progress` (object: chapter_id → percentage_read)
  - `created_at` (timestamp)
- **Relationships**: Can have multiple Bookmarks; tracks progress across Chapters

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### Content Quality
- **SC-001**: All 6 chapters are complete with every required section (Learning Objectives, Introduction, Core Concepts, Practical Application, Summary, Further Reading)
- **SC-002**: Each chapter is between 10-25 pages when rendered (total book ~120 pages max)
- **SC-003**: All code examples execute without errors when copy-pasted (verified through manual testing)
- **SC-004**: Writing style consistency score >90% (measured via automated style checker: sentence length variance <5 words, readability grade level 12-14, passive voice <10%)

#### Performance
- **SC-005**: First Contentful Paint (FCP) <1.5 seconds on 3G network (Lighthouse measurement)
- **SC-006**: Time to Interactive (TTI) <3 seconds on 3G network
- **SC-007**: Largest Contentful Paint (LCP) <2.5 seconds
- **SC-008**: Cumulative Layout Shift (CLS) <0.1
- **SC-009**: Full build completes in <3 minutes (measured via CI/CD pipeline)
- **SC-010**: Chatbot response time p95 <2 seconds, p50 <1 second (measured via API monitoring)

#### RAG Chatbot Accuracy
- **SC-011**: Retrieval precision >80% (relevant chunks in top-5 results for 50 test queries)
- **SC-012**: Zero hallucination tolerance - 100% of answers must cite book content (verified via test suite of 100 queries including trick questions)
- **SC-013**: Source citation accuracy 100% - every citation must point to correct chapter and section
- **SC-014**: Handle 100 concurrent users without timeout errors (load testing with Locust)

#### User Experience
- **SC-015**: Mobile usability score >95 on Google's Mobile-Friendly Test
- **SC-016**: Accessibility audit passes WCAG 2.1 AA compliance (0 critical issues in axe DevTools)
- **SC-017**: Average page load time <2 seconds on 3G (measured across 10 test devices)
- **SC-018**: Text selection → Ask AI interaction completes in <3 seconds end-to-end

#### Deployment & Operations
- **SC-019**: Deploy to GitHub Pages succeeds in <5 minutes with zero manual steps
- **SC-020**: Backend API achieves 99.5% uptime over 30-day period (monitored via health checks)
- **SC-021**: Rate limiting prevents abuse - 0 successful requests beyond 10/min per IP
- **SC-022**: All API endpoints return appropriate HTTP status codes (200, 400, 429, 500) for respective scenarios

#### Free-Tier Compliance
- **SC-023**: Qdrant storage remains under Community Cloud free tier limit (1GB vectors)
- **SC-024**: Neon Postgres stays within free tier (0.5GB storage, 100 hours compute/month)
- **SC-025**: Embedding model size <100MB and runs on CPU (no GPU required)
- **SC-026**: Total API calls stay under free quota for embedding service (if using external provider)

## Constraints *(mandatory)*

### Technical Constraints

- **TC-001**: MUST use Docusaurus 3.x (no other static site generators)
- **TC-002**: MUST use React 18+ for frontend components
- **TC-003**: MUST use TypeScript for type safety (no plain JavaScript)
- **TC-004**: MUST use FastAPI (Python 3.11+) for backend API (no Flask, Django, or Node.js)
- **TC-005**: MUST use Qdrant for vector storage (no Pinecone, Weaviate, or alternatives)
- **TC-006**: MUST use Neon PostgreSQL for metadata storage (no traditional PostgreSQL, MySQL, or MongoDB)
- **TC-007**: MUST use sentence-transformers/all-MiniLM-L6-v2 or BAAI/bge-small-en-v1.5 for embeddings (384 dimensions max)
- **TC-008**: MUST deploy frontend to GitHub Pages (no Vercel, Netlify, or custom hosting)
- **TC-009**: MUST deploy backend to Railway or Render free tier (no AWS, GCP, Azure, or paid hosting)

### Resource Constraints

- **TC-010**: Total vector storage MUST NOT exceed 1GB (Qdrant free tier limit)
- **TC-011**: PostgreSQL storage MUST NOT exceed 0.5GB (Neon free tier limit)
- **TC-012**: Backend compute time MUST NOT exceed 100 hours/month (Neon free tier limit)
- **TC-013**: Embedding model file size MUST be <100MB
- **TC-014**: Frontend bundle size MUST be <200KB initial load (excluding images)
- **TC-015**: No GPU usage permitted - all operations must run on CPU

### Operational Constraints

- **TC-016**: Rate limiting MUST be enforced at 10 requests/minute per IP (non-negotiable)
- **TC-017**: Query length MUST be capped at 1000 characters
- **TC-018**: Selected text context MUST be capped at 500 words
- **TC-019**: Chat history MUST be session-only (no persistent storage across sessions)
- **TC-020**: No user authentication required for reading or basic chatbot usage

### Content Constraints

- **TC-021**: Book MUST contain exactly 6 chapters (no more, no less)
- **TC-022**: Total page count MUST NOT exceed 120 pages
- **TC-023**: Each chapter MUST be 10-25 pages
- **TC-024**: Maximum 5 code examples per chapter
- **TC-025**: Maximum 10 images per chapter
- **TC-026**: All code examples MUST be <50 lines
- **TC-027**: No external API dependencies in code examples (must be self-contained)

### Quality Constraints

- **TC-028**: Test coverage MUST be >80% for backend API
- **TC-029**: All TypeScript code MUST pass strict type checking (no `any` types)
- **TC-030**: All code MUST pass linting (ESLint for TS, Ruff for Python)
- **TC-031**: Lighthouse score MUST be >90 for all pages
- **TC-032**: Build MUST produce zero warnings
- **TC-033**: No `console.log` statements in production code

## Non-Functional Requirements

### Performance Requirements

- **NFR-001**: Page load time (FCP) <1.5s on 3G (1.6 Mbps, 300ms RTT)
- **NFR-002**: Time to Interactive (TTI) <3s on 3G
- **NFR-003**: API response time p95 <2s, p99 <3s
- **NFR-004**: Support 100 concurrent users without degradation
- **NFR-005**: Build time <3 minutes for full build, <30s for incremental
- **NFR-006**: Database query time <100ms (p95)
- **NFR-007**: Vector search latency <200ms (p95)

### Scalability Requirements

- **NFR-008**: System MUST handle 10,000 page views per day
- **NFR-009**: Chatbot MUST handle 1,000 queries per day
- **NFR-010**: Indexing pipeline MUST process 120 pages in <5 minutes
- **NFR-011**: System MUST support adding up to 12 chapters without architectural changes

### Reliability Requirements

- **NFR-012**: Frontend uptime >99.9% (GitHub Pages SLA)
- **NFR-013**: Backend uptime >99.5% (Railway/Render free tier)
- **NFR-014**: Graceful degradation when backend unavailable (static content remains accessible)
- **NFR-015**: Zero data loss - all indexed content recoverable from source markdown
- **NFR-016**: Automatic retry with exponential backoff for transient failures (3 retries max)

### Security Requirements

- **NFR-017**: All traffic MUST use HTTPS (enforced by GitHub Pages and backend hosting)
- **NFR-018**: Input sanitization MUST prevent XSS attacks (DOMPurify or equivalent)
- **NFR-019**: SQL injection prevention via parameterized queries only
- **NFR-020**: API keys MUST be stored in environment variables (never in code)
- **NFR-021**: CORS policy MUST restrict origins to approved domains only
- **NFR-022**: Rate limiting MUST prevent DoS attacks (10 req/min per IP)
- **NFR-023**: User queries MUST be hashed (SHA256) before logging (privacy)
- **NFR-024**: No PII collection without explicit consent

### Accessibility Requirements

- **NFR-025**: WCAG 2.1 AA compliance (contrast ratio ≥4.5:1, keyboard navigation, screen reader support)
- **NFR-026**: All images MUST have descriptive alt text
- **NFR-027**: All interactive elements MUST be keyboard accessible
- **NFR-028**: Focus indicators MUST be visible (outline ≥2px)
- **NFR-029**: Page structure MUST use semantic HTML (nav, main, article, section)
- **NFR-030**: Color MUST NOT be the only means of conveying information

### Maintainability Requirements

- **NFR-031**: All code MUST include inline comments for complex logic
- **NFR-032**: All API endpoints MUST have OpenAPI/Swagger documentation
- **NFR-033**: All environment variables MUST be documented in `.env.example`
- **NFR-034**: Codebase MUST follow consistent style guide (Prettier + ESLint)
- **NFR-035**: Git commits MUST follow Conventional Commits format
- **NFR-036**: All dependencies MUST be pinned to exact versions

### Observability Requirements

- **NFR-037**: All API requests MUST be logged with timestamp, method, endpoint, status, duration
- **NFR-038**: All errors MUST be logged with stack trace and context
- **NFR-039**: Health check endpoint MUST report status of all dependencies
- **NFR-040**: Build process MUST output detailed logs for debugging
- **NFR-041**: Query performance MUST be tracked (embedding time, search time, total time)

## Out of Scope (Explicitly Excluded)

### Phase 1 Exclusions

- **User authentication and login system** - All content is public and free
- **User progress tracking and bookmarks** - Session-based only, no persistence
- **Chapter personalization feature** - Placeholder buttons only, no implementation
- **Urdu translation feature** - Placeholder buttons only, no implementation
- **Multi-language support** - English only in Phase 1
- **Content versioning or history** - Static content, single version
- **User-generated content** - No comments, reviews, or annotations
- **Social sharing features** - No share buttons or social media integration
- **Analytics dashboard** - Basic logging only, no visualization
- **Admin panel** - Content managed via Git/markdown only
- **Search within chapters** - Browser find (Ctrl+F) only, no custom search
- **Dark mode** - Light mode only in Phase 1
- **Print/PDF export** - Browser print only, no custom PDF generation
- **Interactive exercises or quizzes** - Static content only
- **Video or audio content** - Text and images only
- **Offline mode / PWA** - Online-only in Phase 1
- **Email notifications or newsletters** - No communication features

### Future Phase Considerations

Items that MAY be added in Phase 2 (not committed):
- User authentication and profiles
- Progress tracking and bookmarks persistence
- Chapter personalization based on user level
- Urdu translation with separate vector index
- Dark mode toggle
- Advanced analytics and monitoring dashboard
- Interactive code playgrounds
- Downloadable PDF version
- Community discussion forums

## Dependencies

### External Services

- **Qdrant Cloud Community (Free Tier)**: Vector storage for embeddings
  - Dependency Type: Critical - chatbot cannot function without it
  - Fallback: None in Phase 1 (graceful degradation shows error message)

- **Neon PostgreSQL (Free Tier)**: Metadata storage for chunks and queries
  - Dependency Type: Critical - chatbot indexing and logging require it
  - Fallback: None in Phase 1 (graceful degradation shows error message)

- **GitHub Pages**: Static site hosting
  - Dependency Type: Critical - primary deployment target
  - Fallback: Can deploy to Netlify or Vercel if GitHub Pages unavailable

- **Railway or Render (Free Tier)**: Backend API hosting
  - Dependency Type: Critical - chatbot API requires it
  - Fallback: Can switch between Railway and Render (both free tier)

### Libraries and Frameworks

- **Docusaurus 3.x**: Static site generator
- **React 18+**: UI framework
- **TypeScript**: Type safety
- **FastAPI**: Python web framework
- **sentence-transformers**: Embedding generation
- **Qdrant Python Client**: Vector database client
- **psycopg2**: PostgreSQL adapter
- **uvicorn**: ASGI server for FastAPI

### Development Tools

- **Node.js 18+**: Required for Docusaurus build
- **Python 3.11+**: Required for backend
- **Git**: Version control
- **npm or yarn**: Package management
- **pip**: Python package management

## Assumptions

- **AS-001**: GitHub Pages will remain free and accessible for static site hosting
- **AS-002**: Qdrant Community Cloud free tier will provide sufficient storage (1GB) for book content
- **AS-003**: Neon PostgreSQL free tier will provide sufficient storage (0.5GB) and compute (100 hours/month)
- **AS-004**: Railway or Render free tier will provide adequate hosting for backend API
- **AS-005**: sentence-transformers models will run efficiently on CPU without GPU
- **AS-006**: Users have modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **AS-007**: Users have stable internet connection (minimum 1 Mbps for acceptable experience)
- **AS-008**: Content will be written in English with technical accuracy
- **AS-009**: No more than 1,000 daily active users during Phase 1
- **AS-010**: Chatbot queries will be predominantly in English
- **AS-011**: Users will not attempt malicious attacks or spam the system
- **AS-012**: Book content will not require frequent updates (stable knowledge domain)

## Risks

### Technical Risks

- **RISK-001**: Free-tier limits exceeded if usage grows beyond assumptions
  - **Impact**: High - Service disruption
  - **Mitigation**: Implement aggressive rate limiting, monitoring, and alerts at 80% capacity

- **RISK-002**: Qdrant or Neon service outage
  - **Impact**: High - Chatbot unavailable
  - **Mitigation**: Graceful degradation (static site remains functional), health check endpoint

- **RISK-003**: Embedding model performance insufficient on CPU
  - **Impact**: Medium - Slow query responses
  - **Mitigation**: Use most efficient model (MiniLM-L6), implement caching, optimize batch processing

- **RISK-004**: GitHub Pages build fails or takes too long
  - **Impact**: Medium - Delayed deployments
  - **Mitigation**: Keep bundle size minimal, optimize build process, use incremental builds

### Content Risks

- **RISK-005**: Chapter content quality inconsistent across writers
  - **Impact**: Medium - Poor user experience
  - **Mitigation**: Enforce strict chapter template, automated style checking, peer review

- **RISK-006**: Code examples become outdated as frameworks update
  - **Impact**: Low - Frustration when examples don't work
  - **Mitigation**: Pin all dependency versions, include version numbers in examples, quarterly review

### User Experience Risks

- **RISK-007**: Chatbot provides irrelevant or confusing answers
  - **Impact**: Medium - Loss of trust in AI features
  - **Mitigation**: Extensive testing with diverse queries, confidence thresholds, fallback messages

- **RISK-008**: Mobile experience poor due to limited testing
  - **Impact**: Medium - Excludes mobile-first users
  - **Mitigation**: Mobile-first design, responsive testing on real devices, performance budgets

### Operational Risks

- **RISK-009**: Rate limiting too aggressive, blocking legitimate users
  - **Impact**: Medium - User frustration
  - **Mitigation**: Monitor rate limit hits, provide clear user feedback, consider per-user tokens

- **RISK-010**: No monitoring leads to silent failures
  - **Impact**: High - Unknown system state
  - **Mitigation**: Implement health checks, error logging, basic analytics from day 1

## Validation Checklist

### Constitution Compliance

- ✅ **Simplicity Over Complexity**: Single static site + single API backend, minimal dependencies
- ✅ **Content Quality & Accuracy**: Explicit acceptance criteria for technical accuracy, code testing, peer review
- ✅ **AI-Native Design**: Structured for optimal embeddings, semantic chunking, traceable sources
- ✅ **Modern, Clean UI/UX**: Docusaurus clean theme, <2s load time, mobile-first, WCAG AA
- ✅ **Free-Tier Architecture**: All services on free tiers, CPU-only, explicit resource limits
- ✅ **Consistent Structure & Formatting**: Enforced chapter template, style guide, automated checks
- ✅ **Performance & Build Efficiency**: <3min builds, <1.5s FCP, <200KB bundles

### Specification Completeness

- ✅ User Scenarios: 5 stories with priorities, independent tests, acceptance criteria
- ✅ Edge Cases: 10+ scenarios documented with handling strategies
- ✅ Functional Requirements: 47 requirements covering all features
- ✅ Key Entities: 6 entities with attributes and relationships
- ✅ Success Criteria: 26 measurable outcomes with specific thresholds
- ✅ Constraints: 33 constraints across technical, resource, operational, content, quality
- ✅ Non-Functional Requirements: 41 requirements covering performance, scalability, reliability, security, accessibility, maintainability, observability
- ✅ Out of Scope: Clear exclusions to prevent scope creep
- ✅ Dependencies: External services and libraries documented
- ✅ Assumptions: 12 explicit assumptions stated
- ✅ Risks: 10 risks with impact and mitigation

---

**Next Steps**: Create implementation plan (`plan.md`) using `/sp.plan` command after this specification is approved.

**Approval Required**: This specification must be reviewed and approved before proceeding to planning phase.
