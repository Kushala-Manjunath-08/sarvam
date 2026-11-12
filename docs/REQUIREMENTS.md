# REQUIREMENTS — LEGACYOS

> Software Requirements Specification (SRS)
> Human Knowledge Preservation System

**Document Status**: Initial Draft — Day 1 Initialisation
**Date**: November 2026

---

## STATUS LEGEND

- ✅ IMPLEMENTED — Exists in the current codebase.
- 🔲 PLANNED — Documented requirement for future development.

---

## 1. Functional Requirements

### 1.1 AI-Guided Interview System 🔲 PLANNED

- The system shall provide an AI-driven conversational interface that guides users through
  a structured interview process.
- The AI shall generate contextually relevant follow-up questions based on previous responses.
- The system shall support session saving so incomplete interviews can be resumed.
- The AI shall detect topic shifts and adapt its questioning strategy accordingly.
- The system shall provide prompts in the user's preferred language.

### 1.2 Multimodal Memory Collection 🔲 PLANNED

- The system shall accept voice recordings as input for knowledge capture.
- The system shall accept video recordings as input for knowledge capture.
- The system shall accept typed text as input for knowledge capture.
- The system shall allow users to attach supporting documents or photographs to a memory.
- The system shall store all original media files in a durable, unmodified format.

### 1.3 Speech-to-Text Transcription 🔲 PLANNED

- The system shall automatically transcribe uploaded voice and video recordings into text.
- Transcripts shall be associated with their original source recordings.
- The system shall support transcription in multiple languages and dialects.
- Transcripts shall be editable by the user to correct transcription errors.
- The system shall display confidence scores for uncertain transcription segments.

### 1.4 Wisdom Extraction 🔲 PLANNED

- The system shall use AI to identify and extract the following entity types from transcripts:
  - Named individuals (people mentioned in memories).
  - Historical events and time periods.
  - Geographic locations (villages, regions, landmarks).
  - Traditional skills and craftsmanship techniques.
  - Cultural practices and rituals.
  - Personal experiences and life events.
  - Life lessons and practical advice.
  - Agricultural and environmental observations.
- Extracted entities shall be linked back to the source transcript segment.
- The system shall assign confidence scores to extracted entities.

### 1.5 Memory Organisation 🔲 PLANNED

- The system shall organise extracted knowledge into named memory collections.
- Users shall be able to categorise memories by type (personal, agricultural, cultural, etc.).
- The system shall support tagging of memories with custom labels.
- The system shall allow memories to be grouped into themed collections.
- The system shall provide search and filter capabilities across all memories.

### 1.6 Memory Timeline 🔲 PLANNED

- The system shall arrange memories and extracted events chronologically on a visual timeline.
- The timeline shall support approximate dates (e.g., "1970s", "childhood").
- Users shall be able to navigate the timeline by decade, year, or event type.
- The system shall link timeline events to their source memories.

### 1.7 Knowledge Graph 🔲 PLANNED

- The system shall build a graph of relationships between extracted entities.
- Nodes shall represent people, locations, events, skills, and traditions.
- Edges shall represent relationships such as "knew", "lived in", "practised", "taught".
- The system shall provide a visual interface for exploring the knowledge graph.
- The knowledge graph shall be queryable by entity name or relationship type.

### 1.8 RAG-Based Memory Chat 🔲 PLANNED

- The system shall provide a conversational interface for querying preserved memories.
- Responses shall be generated using retrieval-augmented generation (RAG) based on
  relevant memory embeddings.
- Every response shall include citations linking to the source memory or transcript.
- The system shall clearly distinguish AI-generated summaries from original source content.

### 1.9 Multilingual Support 🔲 PLANNED

- The system shall support knowledge capture in regional languages including Hindi, Tamil,
  Telugu, Kannada, Malayalam, Bengali, Marathi, and others.
- The user interface shall be available in multiple languages.
- Transcription shall operate in the language spoken by the knowledge holder.
- Extracted knowledge shall be stored with language metadata.

### 1.10 Source Verification 🔲 PLANNED

- Every piece of extracted knowledge shall be linked to its original source recording
  or transcript.
- Users shall be able to access the original recording directly from any extracted memory.
- The system shall display timestamps within recordings that correspond to extracted content.
- The system shall clearly label AI-extracted content versus direct user-provided content.

---

## 2. Non-Functional Requirements

### 2.1 Security 🔲 PLANNED

- All user data shall be encrypted at rest and in transit (AES-256 and TLS 1.3+).
- Authentication shall use secure token-based mechanisms (JWT with refresh token rotation).
- API endpoints shall be protected against SQL injection, XSS, and CSRF.
- File uploads shall be validated for type, size, and content before processing.
- Personal information shall be handled in compliance with applicable data protection regulations.

### 2.2 Privacy 🔲 PLANNED

- Users shall have full control over the visibility of their memories (private, family,
  community, or public).
- The system shall provide clear data deletion capabilities so users can remove their content.
- No user data shall be used for model training without explicit opt-in consent.
- Personal identifying information shall not be exposed in public-facing APIs.

### 2.3 Scalability 🔲 PLANNED

- The backend architecture shall support horizontal scaling to accommodate growing users.
- The vector database shall scale to support millions of memory embeddings.
- The file storage system shall support large-scale media archives.
- Database queries shall be optimised with appropriate indexing for memory search operations.

### 2.4 Reliability 🔲 PLANNED

- The system shall target 99.5% uptime for core memory capture and retrieval features.
- All uploaded media files shall be stored with redundant backups.
- The system shall implement graceful error handling so partial failures do not cause data loss.
- Transcription and extraction jobs shall be retried automatically on failure.

### 2.5 Performance 🔲 PLANNED

- The homepage and primary navigation shall load within 2 seconds on standard broadband.
- Memory search queries shall return results within 3 seconds.
- Transcription of a 10-minute audio recording shall complete within 5 minutes.
- The RAG-based chat interface shall respond within 5 seconds for typical queries.

### 2.6 Accessibility 🔲 PLANNED

- The frontend shall conform to WCAG 2.1 Level AA accessibility guidelines.
- All interactive elements shall be keyboard navigable.
- Images and media elements shall include descriptive alternative text.
- The interface shall support screen readers.
- Colour contrast ratios shall meet WCAG minimum standards.

### 2.7 Usability 🔲 PLANNED

- The knowledge capture interface shall be usable by individuals with minimal digital literacy.
- Core workflows shall be completable in fewer than 5 steps.
- The interface shall provide clear feedback for all user actions.
- Error messages shall be descriptive and actionable.

### 2.8 Data Integrity 🔲 PLANNED

- Original recordings shall never be modified or deleted by the AI processing pipeline.
- Extracted knowledge shall always be linked to its source, preserving traceability.
- All database writes shall use transactions to prevent partial data corruption.
- The system shall detect and flag duplicate memory uploads.

---

## 3. User Requirements

### 3.1 Families

- Shall be able to create a family knowledge collection.
- Shall be able to record an elder's stories through voice, video, or text.
- Shall be able to explore preserved memories through a visual timeline.
- Shall be able to share specific memories with other family members.
- Shall be able to ask questions about family history through conversational chat.

### 3.2 Farmers and Agricultural Communities

- Shall be able to record traditional farming knowledge in regional languages.
- Shall be able to categorise knowledge by crop, season, or technique.
- Shall be able to search for specific agricultural practices across all preserved memories.

### 3.3 Artisans and Craftspeople

- Shall be able to record demonstrations of techniques through video.
- Shall be able to annotate video recordings with descriptions of specific techniques.
- Shall be able to link related techniques and traditions within a knowledge collection.

### 3.4 Teachers and Educational Institutions

- Shall be able to create institutional knowledge collections.
- Shall be able to manage multiple knowledge contributors within an institution.
- Shall be able to search and retrieve teaching methods and subject-specific insights.

### 3.5 Historians and Researchers

- Shall be able to search across all accessible knowledge collections.
- Shall be able to export memories and transcripts in standard formats.
- Shall be able to access source recordings with precise timestamps for citation.

### 3.6 Governments and NGOs

- Shall be able to create large-scale regional knowledge preservation projects.
- Shall be able to manage multiple contributors across different communities.
- Shall be able to generate reports on preserved knowledge categories and coverage.

---

## 4. System Requirements

### 4.1 Frontend (Basic homepage ✅ IMPLEMENTED — Full features 🔲 PLANNED)

- Shall provide a responsive, accessible user interface built with Next.js and TypeScript.
- Shall handle all user interactions for knowledge capture, browsing, and retrieval.
- Shall communicate with the backend exclusively through the REST API.
- Shall manage client-side authentication state securely.

### 4.2 Backend 🔲 PLANNED

- Shall provide a RESTful API built with Python and FastAPI.
- Shall handle all business logic, file processing orchestration, and AI pipeline management.
- Shall manage user authentication and authorisation.
- Shall interface with the database, vector store, and external AI services.

### 4.3 Database 🔲 PLANNED

- Shall store all structured data including user accounts, memory metadata, transcripts,
  and extracted knowledge using PostgreSQL.
- Shall maintain referential integrity between memories, transcripts, and extracted entities.

### 4.4 AI Services 🔲 PLANNED

- Shall provide speech-to-text transcription through the Whisper model.
- Shall provide knowledge extraction through the Groq API (LLM).
- Shall generate text embeddings for vector search.
- Shall power the RAG-based conversational chat interface.

---

## 5. AI Requirements 🔲 PLANNED

### 5.1 Speech Recognition

- Shall use OpenAI Whisper for transcription.
- Shall support multilingual transcription with automatic language detection.
- Shall produce timestamped transcripts for source verification.

### 5.2 Intelligent Knowledge Extraction

- Shall use a large language model via the Groq API.
- Shall perform named entity recognition for people, places, events, skills, and traditions.
- Shall identify key themes, life lessons, and practical knowledge within transcripts.
- Shall return structured JSON output for each extracted entity.

### 5.3 Vector Embeddings and Retrieval

- Text embeddings shall be generated for all transcripts and extracted knowledge items.
- Embeddings shall be stored in ChromaDB for similarity-based retrieval.
- The RAG pipeline shall use LangChain to orchestrate retrieval and response generation.

### 5.4 Multilingual Processing

- The AI pipeline shall preserve the original language of recordings.
- Extraction and summarisation shall operate on translated content when required.
- The system shall store both original-language and translated versions.

### 5.5 Source Verification

- All AI-generated content shall include provenance metadata linking to source recordings.
- The system shall clearly label AI-generated summaries versus verbatim transcriptions.

---

## 6. Data Requirements 🔲 PLANNED

| Data Type | Format | Storage | Notes |
|---|---|---|---|
| Voice Recordings | MP3 / AAC | Object Storage | Max 500MB per file, immutable |
| Video Recordings | MP4 / H.264 | Object Storage | Max 2GB per file, immutable |
| Text Inputs | UTF-8 Plain Text | PostgreSQL | Stored directly in database |
| Transcripts | Structured text with timestamps | PostgreSQL | Full-text search indexed |
| Extracted Entities | JSON records | PostgreSQL | Linked to source transcripts |
| Vector Embeddings | Float arrays | ChromaDB | Linked by document ID |
| Graph Data | Nodes and edges | Neo4j (optional) | People, places, events, skills |

---

## 7. Future Integration Requirements 🔲 PLANNED

| Integration | Purpose | Technology |
|---|---|---|
| Speech Recognition | Convert voice/video to text | OpenAI Whisper |
| LLM API | Knowledge extraction and chat | Groq API |
| Vector Store | Semantic similarity search | ChromaDB |
| RAG Orchestration | Retrieval-augmented generation pipeline | LangChain |
| Knowledge Graph | Entity relationship storage and traversal | Neo4j (optional) |
| File Storage | Durable media file storage | S3-compatible object storage |
| Authentication | Secure user identity management | JWT-based auth |

---

## 8. Out of Scope — Current Phase

The following are explicitly out of scope for the Day 1 initialisation phase:

- Backend API implementation.
- Database schema creation.
- AI pipeline integration.
- Authentication system.
- File upload functionality.
- Memory management features.
- Timeline, knowledge graph, or chat features.
- Any external API connections or credentials.

