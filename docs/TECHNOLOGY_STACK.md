# TECHNOLOGY STACK — LEGACYOS

> Human Knowledge Preservation System
> **Status: Planned Stack — Day 1 Initialisation**

---

## STATUS LEGEND

- ✅ CONFIGURED — Installed and configured in the current codebase.
- 🔲 PLANNED — Selected for future implementation.

---

## 1. Frontend Technologies

### 1.1 Next.js ✅ CONFIGURED

**Version**: 14+ (App Router)

**Why Selected**: Server-side rendering and static generation for fast initial page loads.
File-based routing reduces boilerplate. Built-in image optimisation and performance
features. Strong TypeScript support and long-term Vercel backing.

**Responsibility**: Serves all user-facing pages. Handles routing between homepage,
capture, memories, timeline, graph, and chat pages.

**Interacts With**: TypeScript, Tailwind CSS, Backend FastAPI via REST API.

---

### 1.2 TypeScript ✅ CONFIGURED

**Version**: 5+

**Why Selected**: Static type checking reduces runtime errors in a complex data-driven
application. Improves developer experience with IDE autocompletion. Ensures data contracts
between frontend and backend API are well-defined.

**Responsibility**: Types all frontend components, API response models, and state.
Defines interfaces for memory, transcript, entity, timeline, and chat data structures.

**Interacts With**: Next.js framework, all frontend components and hooks.

---

### 1.3 Tailwind CSS ✅ CONFIGURED

**Version**: 3+

**Why Selected**: Utility-first CSS enables rapid, consistent UI development.
Highly customisable design tokens. Excellent dark mode and responsive design support.
Minimal final bundle size through built-in purging.

**Responsibility**: Provides all styling including the dark futuristic visual language.
Manages design tokens through `tailwind.config.ts`. Handles responsive layouts across
all viewports.

**Interacts With**: Next.js components, globals.css for base styles.

---

## 2. Backend Technologies

### 2.1 Python 🔲 PLANNED

**Version**: 3.11+

**Why Selected**: The leading language for AI and machine learning integrations.
Rich ecosystem of data processing, NLP, and AI libraries. FastAPI is Python-native
with excellent performance. Strong async support for concurrent AI processing jobs.

**Responsibility**: Implements all backend business logic and API endpoints.
Orchestrates the AI processing pipeline. Manages file processing, job queuing,
and database interactions.

---

### 2.2 FastAPI 🔲 PLANNED

**Version**: 0.110+

**Why Selected**: One of the fastest Python web frameworks, built on ASGI. Automatic
OpenAPI documentation from type hints. Native async/await support for long-running AI
tasks. Excellent Pydantic integration for data validation.

**Responsibility**: Exposes the REST API consumed by the Next.js frontend. Handles
authentication, file upload, memory CRUD, and AI job triggering.

**Interacts With**: PostgreSQL via SQLAlchemy, ChromaDB, Groq API, Whisper, LangChain.

---

## 3. Database

### 3.1 PostgreSQL 🔲 PLANNED

**Version**: 15+

**Why Selected**: Mature, production-grade relational database with ACID compliance.
Excellent full-text search for transcript and memory search. JSONB support for flexible
extracted entity data. Wide hosting support (Supabase, Railway, AWS RDS, self-hosted).

**Responsibility**: Stores all structured application data — users, collections, memories,
recordings, transcripts, extracted entities, and timeline events.

**Interacts With**: FastAPI backend via SQLAlchemy ORM.

---

## 4. AI Technologies

### 4.1 Groq API 🔲 PLANNED

**Models**: LLaMA 3, Mixtral via Groq's inference infrastructure.

**Why Selected**: Extremely fast LLM inference critical for responsive extraction and
chat. Supports state-of-the-art open models without vendor lock-in. Simple REST API
compatible with standard OpenAI-style clients. Cost-effective for high-volume inference.

**Responsibility**: Performs intelligent knowledge extraction from transcripts (entity
recognition, theme identification, life lesson extraction). Generates natural language
responses in the RAG-based chat interface. Supports multilingual content understanding.

**Interacts With**: FastAPI backend, LangChain RAG pipeline.

---

### 4.2 Whisper 🔲 PLANNED

**Provider**: OpenAI (open-source model, self-hostable)

**Why Selected**: State-of-the-art speech recognition with strong multilingual support
across 90+ languages including Indian regional languages. Can be run locally to avoid
sending sensitive personal recordings externally. Produces word-level timestamps enabling
precise source verification.

**Responsibility**: Transcribes all uploaded voice and video recordings into timestamped
text. Detects the spoken language automatically. Produces transcripts that are the
foundation for all downstream AI processing.

**Interacts With**: FastAPI backend, triggered by upload events.

---

## 5. RAG and AI Orchestration

### 5.1 LangChain 🔲 PLANNED

**Version**: 0.2+

**Why Selected**: The leading framework for building RAG pipelines and LLM-powered
applications. Provides abstractions for document loading, chunking, embedding, retrieval,
and generation. Native integration with ChromaDB, Groq, and other providers.

**Responsibility**: Orchestrates the end-to-end RAG pipeline for the memory chat
interface. Manages document chunking and embedding generation for ChromaDB ingestion.
Retrieves relevant memory chunks based on user questions. Combines retrieved context
with LLM generation to produce cited responses.

**Interacts With**: ChromaDB (retrieval), Groq API (generation), FastAPI backend.

---

## 6. Vector Database

### 6.1 ChromaDB 🔲 PLANNED

**Version**: 0.5+

**Why Selected**: Purpose-built, open-source vector database optimised for embedding
storage and search. Simple Python API, easy to integrate with LangChain and FastAPI.
Supports metadata filtering alongside vector similarity search. Self-hostable for
data privacy.

**Responsibility**: Stores vector embeddings for all transcripts and extracted knowledge.
Enables semantic similarity search for the RAG chat interface. Supports filtering by
collection, language, entity type, and date range.

**Interacts With**: LangChain RAG pipeline, FastAPI backend.

---

## 7. Knowledge Graph

### 7.1 Neo4j 🔲 PLANNED (Optional)

**Version**: 5+

**Why Selected**: Industry-leading graph database optimised for relationship queries.
Cypher query language is expressive for graph traversal. Native graph storage provides
performance advantages for relationship-heavy queries.

**Responsibility**: Stores extracted entities as graph nodes. Stores relationships as
directed, labelled edges. Powers the visual knowledge graph interface. Enables complex
queries across people, places, events, skills, and traditions.

**Interacts With**: FastAPI backend via Neo4j Python driver.

> Neo4j is optional. PostgreSQL can serve as a fallback for basic relationship storage
> in early phases.

---

## 8. Technology Interaction Summary

```
Next.js Frontend
    ↕ REST API (JSON / HTTP)
FastAPI Backend
    ↕ SQLAlchemy ORM      → PostgreSQL    (structured data)
    ↕ ChromaDB Python SDK → ChromaDB      (vector embeddings)
    ↕ Neo4j Driver        → Neo4j         (knowledge graph, optional)
    ↕ Whisper SDK         → Whisper       (speech transcription)
    ↕ Groq Python SDK     → Groq API      (LLM inference)
    ↕ LangChain           → RAG Pipeline  (retrieval + generation)
```

---

## 9. Configuration Status

| Technology | Status | Config File / Notes |
|---|---|---|
| Next.js | ✅ Configured | `frontend/next.config.ts` |
| TypeScript | ✅ Configured | `frontend/tsconfig.json` |
| Tailwind CSS | ✅ Configured | via `postcss.config.mjs` |
| Python / FastAPI | 🔲 Planned | `backend/` (placeholder only) |
| PostgreSQL | 🔲 Planned | `DATABASE_URL` env var |
| Groq API | 🔲 Planned | `GROQ_API_KEY` env var |
| Whisper | 🔲 Planned | Backend Python dependency |
| LangChain | 🔲 Planned | Backend Python dependency |
| ChromaDB | 🔲 Planned | Backend Python dependency |
| Neo4j | 🔲 Planned | Optional — `NEO4J_URI` env var |

