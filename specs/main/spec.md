# Feature Specification: RAG Chatbot for Physical AI Textbook

**Feature**: Phase 2 - Intelligent RAG Chatbot
**Date**: 2025-01-01
**Status**: Implementation Complete

## Overview

Build and embed a fully functional Retrieval-Augmented Generation (RAG) chatbot inside the published Physical AI & Humanoid Robotics textbook that can answer questions based on the entire book content or user-selected text.

## Goals

1. Enable students to ask questions about any topic in the textbook
2. Provide accurate, context-aware answers using OpenAI GPT-4o-mini
3. Support two query modes:
   - **Full-book mode**: Search across all 6 chapters
   - **Selected-text mode**: Answer questions strictly limited to user-highlighted text
4. Embed chatbot on every page of the Docusaurus site
5. Deploy on free-tier infrastructure (Qdrant Cloud, Neon PostgreSQL)

## Functional Requirements

### FR1: Document Ingestion
- Parse all 6 chapter markdown files from `/website/docs`
- Chunk content intelligently (800 chars with 200 char overlap)
- Generate embeddings using OpenAI text-embedding-ada-002
- Store vectors in Qdrant Cloud (free tier: 1GB)
- Store metadata (chapter, section, text) in Neon PostgreSQL (free tier: 0.5GB)

### FR2: Full-Book Query Mode
- Accept natural language questions from users
- Generate query embedding using OpenAI
- Perform semantic search in Qdrant (top-k retrieval)
- Retrieve metadata from Neon
- Generate answer using OpenAI GPT-4o-mini with retrieved context
- Return answer with source citations (chapter, section, relevance score)

### FR3: Selected-Text Query Mode
- Detect text selection on page using `window.getSelection()`
- Display visual indicator when text is selected
- Accept questions about the selected text only
- Generate answer using GPT-4o-mini without vector search
- Clear selection after query or on user dismiss

### FR4: React Chat Widget
- Floating action button (bottom-right corner)
- Modal interface with chat history
- Message input with Enter-to-send
- Loading states and error handling
- Source citation display
- Persistent across page navigation

### FR5: Global Integration
- Chatbot appears on every Docusaurus page
- Integrated via Root.tsx theme override
- Session management with localStorage
- Responsive design (mobile + desktop)

### FR6: Backend API
- FastAPI server with CORS support
- Rate limiting (10 requests/min per IP)
- Health check endpoint for all services
- POST /api/query endpoint
- Request schema: `{ question, top_k, selected_text? }`
- Response schema: `{ answer, sources[], query_time_ms }`

## Non-Functional Requirements

### Performance
- Query response time: <3 seconds (p95)
- Embedding generation: <1 second per chunk
- Vector search: <500ms
- Support concurrent queries (10+ simultaneous users)

### Reliability
- 99% uptime for chatbot service
- Graceful degradation if services unavailable
- Error messages for rate limits, timeouts, API failures

### Security
- API keys stored in environment variables
- No sensitive data in logs
- CORS restricted to known origins
- Rate limiting per IP address

### Cost
- Target: <$10/month for moderate usage (100-200 queries/day)
- OpenAI usage: ~$0.02-0.05 per query
- Qdrant: Free tier (1GB sufficient)
- Neon: Free tier (0.5GB sufficient)
- Railway/Render: Free tier (500 hours/month)

### Scalability
- Handle 6 chapters (~50k words total)
- Support 200-300 vectors (chunks)
- Scale to 1000 queries/day without infrastructure changes

## Technical Stack

### Backend
- **Framework**: FastAPI 0.110+
- **Language**: Python 3.10+
- **Embeddings**: OpenAI text-embedding-ada-002 (1536 dimensions)
- **LLM**: OpenAI GPT-4o-mini
- **Vector DB**: Qdrant Cloud (free tier)
- **Metadata DB**: Neon PostgreSQL (free tier)
- **Deployment**: Railway or Render (free tier)

### Frontend
- **Framework**: React + Docusaurus 3.9.2
- **Language**: TypeScript
- **State**: React hooks (useState, useEffect)
- **Storage**: localStorage for chat history
- **Deployment**: Vercel (already deployed)

## User Stories

### US1: Ask General Question
**As a** student reading the textbook
**I want to** ask questions about any topic
**So that** I can quickly find information without searching manually

**Acceptance Criteria:**
- User clicks chatbot icon
- User types question: "What is Physical AI?"
- System returns answer with sources from Chapter 1
- Sources show chapter number, section title, relevance score

### US2: Ask About Selected Text
**As a** student reading a specific section
**I want to** ask questions about text I've highlighted
**So that** I can get explanations focused on that exact content

**Acceptance Criteria:**
- User highlights paragraph about "sensor fusion"
- Text selection indicator appears in chatbot
- User asks: "Explain this in simpler terms"
- System uses only highlighted text as context
- Answer is tailored to selected content only

### US3: Navigate with Chat History
**As a** student using multiple chapters
**I want to** keep my chat history as I navigate
**So that** I can refer back to previous answers

**Acceptance Criteria:**
- User asks question on Chapter 1
- User navigates to Chapter 3
- Chatbot icon still appears
- User opens chatbot and sees previous conversation
- User can continue asking questions

### US4: Handle Errors Gracefully
**As a** student using the chatbot
**I want to** see clear error messages when something fails
**So that** I know what to do next

**Acceptance Criteria:**
- Rate limit exceeded → Show "Please wait" message
- Network error → Show "Connection failed, retry"
- No results → Show "Try rephrasing your question"
- Service down → Show "Chatbot temporarily unavailable"

## Architecture

```
┌─────────────────────────────────────────┐
│     Docusaurus Frontend (Vercel)        │
│  ┌────────────────────────────────┐    │
│  │  Root.tsx                       │    │
│  │    ├─ ChatbotIcon              │    │
│  │    └─ ChatbotModal              │    │
│  │         └─ useChatbot hook      │    │
│  └────────────────────────────────┘    │
└──────────────┬──────────────────────────┘
               │ HTTP POST /api/query
               ↓
┌─────────────────────────────────────────┐
│   FastAPI Backend (Railway/Render)      │
│  ┌────────────────────────────────┐    │
│  │  RAG Pipeline                   │    │
│  │    1. OpenAI Embedding          │    │
│  │    2. Qdrant Vector Search      │    │
│  │    3. Neon Metadata Lookup      │    │
│  │    4. GPT-4o-mini Generation    │    │
│  └────────────────────────────────┘    │
└──┬──────────┬────────────┬──────────────┘
   │          │            │
   ↓          ↓            ↓
┌──────┐  ┌──────┐  ┌──────────┐
│OpenAI│  │Qdrant│  │   Neon   │
│ API  │  │Cloud │  │PostgreSQL│
└──────┘  └──────┘  └──────────┘
```

## Data Model

### Chunk Metadata (Neon PostgreSQL)
```sql
CREATE TABLE chunk_metadata (
    chunk_id UUID PRIMARY KEY,
    chapter_id INTEGER NOT NULL,
    section_id VARCHAR(50) NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    chunk_index INTEGER NOT NULL,
    token_count INTEGER NOT NULL,
    char_count INTEGER NOT NULL,
    preview_text TEXT NOT NULL,
    full_text TEXT NOT NULL,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chapter_id, section_id, chunk_index)
);
```

### Vector Store (Qdrant)
```python
{
    "id": "uuid",
    "vector": [float; 1536],  # OpenAI embedding
    "payload": {
        "chapter_id": int,
        "section_id": str,
        "section_title": str,
        "chunk_index": int,
        "text": str,
        "preview_text": str
    }
}
```

## API Contracts

### POST /api/query
**Request:**
```json
{
    "question": "What is Physical AI?",
    "top_k": 5,
    "selected_text": null | "user highlighted text..."
}
```

**Response (Success):**
```json
{
    "answer": "Physical AI refers to...",
    "sources": [
        {
            "chunk_id": "uuid",
            "chapter_id": 1,
            "section_id": "1.1",
            "section_title": "Introduction to Physical AI",
            "preview_text": "Physical AI is...",
            "relevance_score": 0.89
        }
    ],
    "query_time_ms": 1450
}
```

**Response (Error):**
```json
{
    "error": "rate_limit_exceeded",
    "message": "Please wait before sending another request",
    "details": { "retry_after": 45 }
}
```

### GET /health
**Response:**
```json
{
    "status": "healthy",
    "qdrant": "connected",
    "postgres": "connected",
    "openai": "connected",
    "timestamp": "2025-01-01T12:00:00Z"
}
```

## Out of Scope

- Multi-language support (English only)
- Voice input/output
- Image/diagram understanding
- User authentication for chat history
- Advanced analytics dashboard
- Custom training of models
- PDF export of chat conversations
- Integration with external learning platforms

## Success Metrics

1. **Functionality**: All 6 chapters indexed successfully
2. **Accuracy**: 90%+ of answers cite correct chapters
3. **Performance**: <3s query response time (p95)
4. **Usage**: Students ask average 5+ questions per session
5. **Cost**: <$10/month operational cost
6. **Reliability**: <5% error rate for valid queries

## Implementation Status

✅ **Completed:**
- Backend FastAPI setup with OpenAI integration
- Qdrant Cloud vector database configuration
- Neon PostgreSQL metadata storage
- Document ingestion pipeline for 6 chapters
- RAG service with full-book and selected-text modes
- React chat widget with text selection detection
- Global chatbot integration on all pages
- Deployment configuration (Railway + Vercel)
- Comprehensive documentation (README, QUICKSTART, DEPLOYMENT)

📋 **Next Steps:**
1. Deploy backend to Railway with environment variables
2. Run document ingestion to populate vector database
3. Test end-to-end integration
4. Monitor costs and performance
5. Gather student feedback for improvements
