# DIRECTORY STRUCTURE — LEGACYOS

> Human Knowledge Preservation System
> **Status: Day 1 Initialisation**

---

## Root Structure

```
sarvam/
├── frontend/           # Next.js frontend application
├── backend/            # Python FastAPI backend (placeholder)
├── docs/               # Project documentation
├── .gitignore          # Git ignore rules
└── README.md           # Root project README
```

---

## Detailed Structure

```
sarvam/
│
├── frontend/
│   ├── public/
│   │   └── images/             # Static image assets
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout (HTML shell, fonts, metadata)
│   │   │   ├── page.tsx        # Homepage route (/)
│   │   │   └── globals.css     # Global CSS and Tailwind base styles
│   │   ├── components/         # Reusable UI components (Phase 2+)
│   │   └── styles/             # Additional CSS modules (Phase 2+)
│   ├── package.json            # Node.js dependencies and scripts
│   ├── tsconfig.json           # TypeScript compiler configuration
│   ├── next.config.ts          # Next.js configuration
│   └── .env.example            # Environment variable template
│
├── backend/
│   └── README.md               # Backend placeholder
│
├── docs/
│   ├── PROJECT_OVERVIEW.md
│   ├── REQUIREMENTS.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── TECHNOLOGY_STACK.md
│   ├── DEVELOPMENT_ROADMAP.md
│   └── DIRECTORY_STRUCTURE.md  # This file
│
├── .gitignore
└── README.md
```

---

## File and Folder Descriptions

### `/frontend` ✅ INITIALISED

The complete Next.js frontend application. All user interface code lives here.

### `/frontend/public/images`

Static image assets served directly by Next.js without processing. Currently
empty — logos, icons, and illustrations will be added in Phase 2+.

### `/frontend/src/app/layout.tsx` ✅ IMPLEMENTED

Root layout component. Wraps every page. Defines the HTML document structure,
sets the monospace font, applies global metadata (title, description), and
imports global CSS. All pages inherit this layout via the Next.js App Router.

### `/frontend/src/app/page.tsx` ✅ IMPLEMENTED

Homepage component at the `/` route. Contains the LEGACYOS landing page:
navigation bar, hero section, three informational sections (The Problem,
Our Vision, Our Approach), and footer. Styled with the dark futuristic
design system using Tailwind CSS.

### `/frontend/src/app/globals.css` ✅ IMPLEMENTED

Global stylesheet imported once in `layout.tsx`. Contains Tailwind CSS
directives, CSS custom properties for the design system, and global base
element styles.

### `/frontend/src/components` 🔲 PLANNED (Phase 2+)

Reusable React components shared across multiple pages. Currently empty.

Planned contents:
- `Navbar.tsx` — Persistent navigation bar
- `Button.tsx` — Styled button variants
- `Card.tsx` — Memory card component
- `MemoryCapture.tsx` — Voice/video/text capture interface
- `Timeline.tsx` — Chronological timeline component
- `ChatInterface.tsx` — RAG conversational chat interface
- `KnowledgeGraph.tsx` — Graph visualisation component

### `/frontend/src/styles` 🔲 PLANNED (Phase 2+)

CSS module files for component-specific styles not handled by Tailwind.
Currently empty.

### `/frontend/package.json` ✅ IMPLEMENTED

Node.js project manifest. Defines npm scripts (`dev`, `build`, `start`,
`lint`) and all production and development dependencies.

### `/frontend/tsconfig.json` ✅ IMPLEMENTED

TypeScript compiler configuration. Defines compilation target, module
resolution, path aliases (`@/*` maps to `./src/*`), and strict mode.

### `/frontend/next.config.ts` ✅ IMPLEMENTED

Next.js configuration. Currently minimal. Will be expanded in later phases
to configure image domains, API proxy rewrites, and environment variable
exposure to the browser.

### `/frontend/.env.example` ✅ IMPLEMENTED

Template showing all required environment variables without real values.
Copy this file to `.env.local` and fill in real values. The `.env.local`
file must never be committed to version control.

---

### `/backend` 🔲 PLANNED (Phase 3+)

Placeholder directory for the Python FastAPI backend. Contains only a README
in this phase.

Planned structure (Phase 3+):
```
backend/
├── app/
│   ├── main.py           # FastAPI application entry point
│   ├── api/              # Route handlers
│   ├── models/           # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic request/response schemas
│   ├── services/         # Business logic and AI pipeline
│   └── core/             # Config, auth, database connection
├── requirements.txt      # Python dependencies
├── alembic/              # Database migration scripts
└── README.md             # Backend setup instructions
```

### `/backend/README.md` ✅ IMPLEMENTED (placeholder)

Backend setup and development instructions. Currently a placeholder with
planned structure and technology overview. Will be expanded with actual
setup commands in Phase 3.

---

### `/docs` ✅ IMPLEMENTED

All project documentation written in Markdown. Any developer or AI coding
assistant can fully understand the project from these files alone.

| File | Purpose |
|---|---|
| `PROJECT_OVERVIEW.md` | Why LEGACYOS exists, what it does, who it is for |
| `REQUIREMENTS.md` | Full Software Requirements Specification (SRS) |
| `SYSTEM_ARCHITECTURE.md` | Architecture diagrams and layer descriptions |
| `TECHNOLOGY_STACK.md` | Every technology, why selected, what it does |
| `DEVELOPMENT_ROADMAP.md` | 9-phase development plan with tasks per phase |
| `DIRECTORY_STRUCTURE.md` | Purpose of every folder and file (this file) |

---

### `/.gitignore` ✅ IMPLEMENTED

Prevents committing sensitive or generated files to version control:
- `node_modules/` — npm dependencies (reinstalled from package.json)
- `.env.local`, `.env` — environment variables and API keys
- `.next/` — Next.js build cache and output directory
- `__pycache__/`, `.venv/` — Python bytecode and virtual environments
- `*.pyc`, `*.egg-info/` — Python build artifacts
- System files (`.DS_Store`, `Thumbs.db`)

---

### `/README.md` ✅ IMPLEMENTED

Root project README. The first file any developer sees when they open the
repository. Contains: project title, description, problem statement, proposed
solution, main planned capabilities, technology stack, directory structure
overview, setup instructions for the frontend, and current development status.

