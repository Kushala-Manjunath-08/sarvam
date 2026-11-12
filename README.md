# LEGACYOS
### Human Knowledge Preservation System
**Preserving Human Wisdom Beyond Generations.**

---

## What is LEGACYOS?

LEGACYOS is an AI-powered Human Knowledge Preservation System designed to capture,
organise, and transmit human wisdom across generations.

Elderly individuals, traditional farmers, master artisans, experienced teachers, local
historians, and community elders possess decades of irreplaceable knowledge. This knowledge
exists in conversational and experiential form — not in books or databases. When these
individuals are no longer available, that knowledge is permanently lost.

LEGACYOS transforms raw human memory into structured, searchable, and conversationally
accessible digital knowledge that future generations can explore.

---

## The Problem

Human knowledge is disappearing at an unprecedented rate.

- Urbanisation separates younger generations from rural knowledge holders.
- Traditional apprenticeship systems are breaking down.
- Accelerating technology adoption creates generational knowledge gaps.
- Elderly knowledge holders are increasingly isolated from younger generations.

Existing platforms — recording apps, oral history archives, note-taking tools — store
content but cannot intelligently organise, connect, or make it conversationally accessible.

---

## The Solution

LEGACYOS combines AI-guided capture, speech recognition, intelligent extraction, semantic
search, and conversational retrieval into a single platform:

1. **Capture** — Guide individuals through AI interviews. Accept voice, video, and text.
2. **Transcribe** — Convert speech to searchable text using Whisper.
3. **Extract** — Identify people, events, locations, skills, traditions, and life lessons.
4. **Organise** — Structure knowledge into collections, timelines, and categories.
5. **Connect** — Build a knowledge graph linking related people, places, and events.
6. **Retrieve** — Enable future generations to ask natural-language questions via RAG chat.

---

## Planned Capabilities

> All capabilities below are **PLANNED**. See current status at the bottom of this file.

| Capability | Description |
|---|---|
| AI-Guided Interviews | Contextual follow-up questions to capture detailed experiences |
| Voice / Video / Text Input | Multimodal memory collection |
| Speech-to-Text | Automatic transcription via Whisper |
| Wisdom Extraction | AI identification of people, events, skills, traditions, life lessons |
| Memory Organisation | Structured collections, categories, and tags |
| Memory Timeline | Chronological arrangement of preserved experiences |
| Knowledge Graph | Visual map of relationships between entities |
| RAG Memory Chat | Natural-language Q&A grounded in preserved memories with citations |
| Multilingual Support | Regional language capture and processing |
| Source Verification | Every extracted fact linked back to original recording |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| AI / LLM | Groq API (LLaMA / Mixtral) |
| Speech Recognition | OpenAI Whisper |
| RAG Orchestration | LangChain |
| Vector Database | ChromaDB |
| Knowledge Graph | Neo4j (optional) |

---

## Directory Structure

```
sarvam/
├── frontend/           # Next.js frontend application
│   ├── public/images/  # Static image assets
│   ├── src/app/        # Next.js App Router pages
│   ├── src/components/ # Reusable UI components (Phase 2+)
│   └── src/styles/     # Additional CSS modules (Phase 2+)
├── backend/            # Python FastAPI backend (placeholder)
├── docs/               # Project documentation
├── .gitignore
└── README.md
```

See `docs/DIRECTORY_STRUCTURE.md` for a full breakdown of every file and folder.

---

## Setup — Run the Frontend

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd sarvam

# 2. Navigate to the frontend directory
cd frontend

# 3. Install dependencies
npm install

# 4. Copy the environment variable template
cp .env.example .env.local

# 5. Start the development server
npm run dev
```

The frontend will be available at **http://localhost:3000**.

### Other Frontend Commands

```bash
npm run build    # Create a production build
npm run start    # Run the production build locally
npm run lint     # Run ESLint checks
```

---

## Documentation

All project documentation is in the `docs/` directory.

| Document | Description |
|---|---|
| `docs/PROJECT_OVERVIEW.md` | Full project introduction — problem, solution, vision |
| `docs/REQUIREMENTS.md` | Software Requirements Specification (SRS) |
| `docs/SYSTEM_ARCHITECTURE.md` | Architecture diagrams and layer descriptions |
| `docs/TECHNOLOGY_STACK.md` | Every technology, why selected, what it does |
| `docs/DEVELOPMENT_ROADMAP.md` | 9-phase development plan |
| `docs/DIRECTORY_STRUCTURE.md` | Purpose of every folder and file |

---

## Development Status

**Current Phase**: Phase 1 — Initial Setup ✅ COMPLETE

| Component | Status |
|---|---|
| Project documentation | ✅ Complete |
| Frontend homepage | ✅ Complete |
| Next.js + TypeScript + Tailwind | ✅ Configured |
| Backend (FastAPI) | 🔲 Phase 3 |
| Database (PostgreSQL) | 🔲 Phase 3 |
| Speech recognition (Whisper) | 🔲 Phase 5 |
| AI extraction (Groq) | 🔲 Phase 6 |
| Vector search (ChromaDB) | 🔲 Phase 6 |
| RAG chat (LangChain) | 🔲 Phase 8 |
| Knowledge graph (Neo4j) | 🔲 Phase 7 |

See `docs/DEVELOPMENT_ROADMAP.md` for the full phased plan.

---

## Target Users

Families · Farmers · Artisans · Teachers · Historians · Governments · NGOs

---

> LEGACYOS — Preserving Human Wisdom Beyond Generations.
