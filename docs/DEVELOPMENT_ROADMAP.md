# DEVELOPMENT ROADMAP — LEGACYOS

> Human Knowledge Preservation System
> **Status: Phase 1 Complete — Day 1 Initialisation**

---

## Overview

This roadmap outlines the planned development phases for LEGACYOS. Each phase builds
on the previous one. Phases are sequential but individual tasks within a phase may
be worked on in parallel.

**Current Phase**: Phase 1 — Initial Project Setup ✅ COMPLETE

---

## Phase 1 — Initial Project Setup ✅ COMPLETE

**Goal**: Establish a clean, well-documented project foundation.

**Deliverables**:
- [x] Project concept defined and understood.
- [x] Clean project directory structure created.
- [x] Git repository initialised.
- [x] Detailed documentation written (PROJECT_OVERVIEW, REQUIREMENTS,
      SYSTEM_ARCHITECTURE, TECHNOLOGY_STACK, DEVELOPMENT_ROADMAP, DIRECTORY_STRUCTURE).
- [x] Root README.md created with full project description.
- [x] Basic homepage frontend created with LEGACYOS branding and design system.
- [x] Next.js, TypeScript, and Tailwind CSS configured.
- [x] .env.example created with planned environment variables.
- [x] .gitignore configured.
- [x] Backend placeholder directory created.

**Outcome**: Any developer or AI coding assistant can understand the full project scope,
architecture, and requirements from the documentation alone.

---

## Phase 2 — Frontend Foundation and Navigation 🔲 PLANNED

**Goal**: Build the complete frontend shell with navigation and all planned page routes.

**Tasks**:
- [ ] Create the main application layout with persistent navigation bar.
- [ ] Implement client-side routing for all planned pages.
- [ ] Build the memory capture page (UI only, no backend).
- [ ] Build the memory browser page (UI only, with mock data).
- [ ] Build the timeline page (UI only, with mock data).
- [ ] Build the knowledge graph page (placeholder UI).
- [ ] Build the RAG chat page (placeholder UI).
- [ ] Implement responsive design across all pages.
- [ ] Add loading states and error boundary components.
- [ ] Define TypeScript interfaces for all planned data models.
- [ ] Create reusable UI component library (buttons, cards, inputs, modals).

**Technologies**: Next.js, TypeScript, Tailwind CSS

---

## Phase 3 — Backend and Database Foundation 🔲 PLANNED

**Goal**: Build the FastAPI backend and PostgreSQL database schema.

**Tasks**:
- [ ] Set up Python virtual environment and project structure.
- [ ] Configure FastAPI application with health check endpoint.
- [ ] Design and implement PostgreSQL database schema.
- [ ] Set up SQLAlchemy ORM with Alembic migrations.
- [ ] Implement user authentication (JWT-based).
- [ ] Create CRUD API endpoints for memory collections.
- [ ] Create CRUD API endpoints for individual memories.
- [ ] Implement file upload endpoint with validation.
- [ ] Connect frontend to backend API (replace mock data).
- [ ] Set up CORS configuration for frontend-backend communication.
- [ ] Write basic API tests.

**Technologies**: Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, JWT

---

## Phase 4 — Memory Collection 🔲 PLANNED

**Goal**: Enable users to create and manage knowledge collections and upload memories.

**Tasks**:
- [ ] Implement memory collection creation and management UI.
- [ ] Build the voice recording interface in the browser.
- [ ] Build the video recording interface in the browser.
- [ ] Build the text entry interface.
- [ ] Implement file upload to backend with progress indicator.
- [ ] Store uploaded files in object storage (S3-compatible).
- [ ] Display uploaded memories in the memory browser.
- [ ] Implement memory deletion and editing.
- [ ] Add memory metadata management (title, date, category, tags).

**Technologies**: Next.js, FastAPI, PostgreSQL, Object Storage

---

## Phase 5 — AI Interview and Transcription 🔲 PLANNED

**Goal**: Add AI-guided interviews and automatic speech-to-text transcription.

**Tasks**:
- [ ] Integrate OpenAI Whisper for audio/video transcription.
- [ ] Build background job queue for transcription tasks.
- [ ] Display transcripts in the memory detail view.
- [ ] Allow users to edit and correct transcripts.
- [ ] Build the AI interview interface (guided question flow).
- [ ] Integrate Groq API for dynamic interview question generation.
- [ ] Save interview sessions with associated transcripts.
- [ ] Add multilingual transcription support.

**Technologies**: Whisper, Groq API, FastAPI background tasks

---

## Phase 6 — Wisdom Extraction and Memory Organisation 🔲 PLANNED

**Goal**: Use AI to extract structured knowledge from transcripts and organise memories.

**Tasks**:
- [ ] Build the entity extraction pipeline using Groq LLM.
- [ ] Extract: people, events, locations, skills, traditions, life lessons.
- [ ] Store extracted entities in PostgreSQL with source references.
- [ ] Display extracted entities in the memory detail view.
- [ ] Build the memory search and filter interface.
- [ ] Implement full-text search across transcripts.
- [ ] Build ChromaDB integration for vector embeddings.
- [ ] Generate and store embeddings for all transcripts.
- [ ] Implement semantic search across memories.

**Technologies**: Groq API, LangChain, ChromaDB, PostgreSQL full-text search

---

## Phase 7 — Timeline and Knowledge Graph 🔲 PLANNED

**Goal**: Build the visual timeline and knowledge graph interfaces.

**Tasks**:
- [ ] Build the chronological timeline component.
- [ ] Map extracted events to timeline positions.
- [ ] Support approximate date handling in the timeline.
- [ ] Build the knowledge graph visualisation.
- [ ] Implement Neo4j integration (or PostgreSQL graph queries as fallback).
- [ ] Populate the knowledge graph from extracted entities.
- [ ] Build the graph exploration interface.
- [ ] Connect timeline events and graph nodes to source memories.

**Technologies**: Next.js (visualisation libraries), Neo4j (optional), PostgreSQL

---

## Phase 8 — RAG-Based Conversational Memory Search 🔲 PLANNED

**Goal**: Enable future generations to ask natural-language questions about preserved
memories and receive cited, grounded answers.

**Tasks**:
- [ ] Build the LangChain RAG pipeline end-to-end.
- [ ] Implement memory chunk retrieval from ChromaDB.
- [ ] Integrate Groq LLM for response generation.
- [ ] Build the conversational chat UI.
- [ ] Implement source citation in chat responses.
- [ ] Link citations to original recordings and transcripts.
- [ ] Add conversation history and session management.
- [ ] Implement multilingual query support.

**Technologies**: LangChain, ChromaDB, Groq API, FastAPI, Next.js

---

## Phase 9 — Testing, Polish, and Final Integration 🔲 PLANNED

**Goal**: Ensure the system is production-ready, well-tested, and polished.

**Tasks**:
- [ ] Write unit tests for all backend API endpoints.
- [ ] Write integration tests for the AI pipeline.
- [ ] Write end-to-end tests for critical user flows.
- [ ] Perform accessibility audit and fix WCAG issues.
- [ ] Optimise frontend performance (Core Web Vitals).
- [ ] Implement error monitoring and logging.
- [ ] Security review — authentication, authorisation, input validation.
- [ ] Final UI polish and design consistency review.
- [ ] Write deployment documentation.
- [ ] Deploy to staging environment.

**Technologies**: All — testing frameworks, monitoring tools, CI/CD

---

## Roadmap Summary

| Phase | Name | Status |
|---|---|---|
| 1 | Initial Project Setup | ✅ COMPLETE |
| 2 | Frontend Foundation and Navigation | 🔲 PLANNED |
| 3 | Backend and Database Foundation | 🔲 PLANNED |
| 4 | Memory Collection | 🔲 PLANNED |
| 5 | AI Interview and Transcription | 🔲 PLANNED |
| 6 | Wisdom Extraction and Memory Organisation | 🔲 PLANNED |
| 7 | Timeline and Knowledge Graph | 🔲 PLANNED |
| 8 | RAG-Based Conversational Memory Search | 🔲 PLANNED |
| 9 | Testing, Polish, and Final Integration | 🔲 PLANNED |

