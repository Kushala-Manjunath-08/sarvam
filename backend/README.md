# SARVAM Backend

The FastAPI service provides district content, community media, Karavali places
and timelines, visitor reviews, and moderated community contributions. The
Karavali place and timeline records are maintained in `../data/karavali/`; user
submissions, regional media records, and review records are stored in
`data/community.db`, and uploaded files are stored in `data/uploads/`.

## Run locally

From this directory, install the runtime dependencies if they are not already
available:

```powershell
python -m pip install fastapi uvicorn python-multipart
```

Set an admin token in the same PowerShell session that starts the API. Keep it
private and do not commit it:

```powershell
$env:KARAVALI_ADMIN_TOKEN = python -c "import secrets; print(secrets.token_urlsafe(32))"
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://127.0.0.1:8000`; interactive API documentation
is at `http://127.0.0.1:8000/docs`. The SQLite schema is initialized and
existing review tables are extended without deleting their records when the
service starts.

## Karnataka knowledge assistant

The chat assistant reads source-backed JSONL records from
`../data/karnataka-knowledge-base/documents.jsonl`. The corpus uses the four
fixed regions and their 31 district assignments. Only records marked
`verification_status: "verified"` are searchable; every answer includes links
to the records' sources. Region names and district assignments are in
`../data/karnataka-knowledge-base/regions.json`. The source registry is
generated from the corpus at
`../data/karnataka-knowledge-base/source-registry.json`; it includes review
status and links to primary and additional sources. The local SQLite/FTS index
is rebuilt incrementally when the corpus changes and is stored in
`backend/data/knowledge_index.sqlite3`.

The chat uses retrieval-augmented generation, not model training: it retrieves
verified records and cites their sources. At the current corpus snapshot, 97
verified records cover 31 districts; records needing review are excluded.
Frontend descriptions without claim-level sources are not treated as verified
evidence. The chat uses the current region or district page as a retrieval hint,
but a place explicitly named in the question takes precedence. Without a
configured answer model, it returns a brief extractive answer from the retrieved
evidence. If evidence is weak or missing, it says so rather than guessing.
District-specific questions only use records assigned to or explicitly
mentioning that district. For example, the Shivamogga food answer is sourced
from the Karnataka Tourism guide to Appe Midi in Sagar; broader Kodava food
records are reserved for broader regional questions.

| Purpose | Route |
|---|---|
| Grounded chat and source citations | `POST /api/chat` |
| Corpus and retrieval status | `GET /api/knowledge/status` |
| Incremental reindex | `POST /api/knowledge/reindex` |

With no `GROQ_API_KEY`, chat returns the retrieved evidence excerpts directly
with citations. To enable generated answers, set `GROQ_API_KEY` and an active
`GROQ_MODEL` in the backend process environment. The key stays server-side; a
configured provider error is returned explicitly rather than replaced with a
demo answer.

Keyword retrieval is available by default. To enable hybrid semantic and
keyword retrieval, install `sentence-transformers` and set
`SARVAM_EMBEDDING_MODEL` to a model available to the backend. The model is loaded
only when configured, and the index reports whether semantic embeddings are
active.

The reindex route requires the existing `X-Admin-Token` header and
`KARAVALI_ADMIN_TOKEN`. Keep all backend environment values private; see
`.env.example` for the supported settings.

## Regional visitor gallery

All four regional pages share the same photo/video archive. Published
contributions are stored in SQLite and uploaded media is served from the
backend's persistent `data/uploads/` directory.

| Purpose | Route |
|---|---|
| Load up to 100 published memories for a region | `GET /api/regions/{region_id}/contributions` |
| Save a visitor story with optional photograph or video | `POST /api/regions/{region_id}/contributions` |

The upload requires a valid division district, visit location, display name,
experience description, and confirmation that the contributor has permission
to share the content. Photo/video upload is optional for text-only memories.
Uploads are limited to 100 MB and validated by extension, MIME type, and file
signature. The API returns the saved contribution so the page can display the
media immediately; subsequent visits load it from SQLite. Legacy published
Karavali district uploads remain visible in the shared gallery.

## Karavali routes

| Purpose | Route |
|---|---|
| Filterable place directory | `GET /api/karavali/places` |
| Place detail and source links | `GET /api/karavali/places/{place_id}` |
| District-filtered timeline | `GET /api/karavali/timelines` |
| Public coastal districts and heritage sections | `GET /api/karavali/districts` and `GET /api/karavali/categories` |
| Place photo/video gallery | `GET` and `POST /api/places/{place_id}/media` |
| Visitor reviews | `GET` and `POST /api/places/{place_id}/reviews` |
| Edit/delete a review | `PATCH` and `DELETE /api/places/{place_id}/reviews/{review_id}` |
| Report a review | `POST /api/places/{place_id}/reviews/{review_id}/report` |
| Submit and view approved contributions | `POST` and `GET /api/karavali/contributions` |
| Karavali overview counts | `GET /api/karavali/admin/overview` |
| Edit districts, heritage sections, places, and timeline entries | `GET`, `POST`, `PUT`, and `DELETE /api/karavali/admin/{districts,categories,places,timelines}...` |
| Review pending submissions and reports; hide reported reviews | `/api/karavali/admin/...` |

Supported media are JPG, PNG, WEBP, MP4, and WEBM, with a 100 MB maximum. The
API checks the extension, MIME type, and file signature. Contribution
photographs are limited to image formats. Submitted contributions remain
private until an administrator approves them.

Admin API calls require the `X-Admin-Token` header. The token must be configured
before the backend starts; without it, moderation endpoints return an explicit
service-unavailable response. The moderation interface is
`http://127.0.0.1:3000/admin/karavali`. It includes live record counts,
editors for the Karavali JSON data, and the existing community moderation
queue. Editor image fields must point to an existing local asset under
`frontend/public/images/karavali/`; retain each image's attribution metadata
when changing photo records.

Review ownership uses an unguessable capability token returned only when a
review is created. The browser stores that token locally and the database
stores only its SHA-256 hash. This supports owner-only editing and deletion
without exposing tokens in public review responses; it is not an account or
identity system, and losing the browser token removes the owner's ability to
manage that review. Review reports are de-duplicated by a locally generated
reporter identifier, not by verified user accounts.
