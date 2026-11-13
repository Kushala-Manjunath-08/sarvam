# SARVAM Backend

The FastAPI service provides district content, community media, Karavali places
and timelines, visitor reviews, and moderated community contributions. The
Karavali place and timeline records are maintained in `../data/karavali/`; user
submissions and review records are stored in `data/community.db`, and uploaded
files are stored in `data/uploads/`.

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
