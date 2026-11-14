

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Form,
    Body,
    Depends,
    Header,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional
from app.knowledge_base import router as knowledge_router
import hashlib
import hmac
import json
import logging
import os
import re
import secrets
import uuid
import sqlite3
logger = logging.getLogger(__name__)
app = FastAPI(
    title="LEGACYOS API",
    description="Human Knowledge Preservation System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(knowledge_router)

# Backend folders
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DISTRICT_DIR = DATA_DIR / "districts"
KARAVALI_DATA_DIR = BASE_DIR.parent / "data" / "karavali"
UPLOAD_DIR = DATA_DIR / "uploads"
KARAVALI_DISTRICT_IDS = frozenset({
    "dakshina-kannada",
    "udupi",
    "uttara-kannada",
})
KARAVALI_ADMIN_TOKEN = os.environ.get("KARAVALI_ADMIN_TOKEN", "").strip()


def require_karavali_admin(
    x_admin_token: Optional[str] = Header(default=None),
) -> None:
    if not KARAVALI_ADMIN_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="Karavali administration is unavailable until an admin token is configured.",
        )
    if not x_admin_token or not hmac.compare_digest(
        x_admin_token, KARAVALI_ADMIN_TOKEN
    ):
        raise HTTPException(status_code=401, detail="Invalid admin token.")


UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DISTRICT_DIR.mkdir(parents=True, exist_ok=True)

UPLOADS_FILE = DATA_DIR / "uploads.json"
FEEDBACK_FILE = DATA_DIR / "feedback.json"

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp",
    ".mp4", ".webm"
}

ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"
}

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

# SQLite database for community interactions
DATABASE_FILE = DATA_DIR / "community.db"
REGION_DISTRICTS = {
    "old-mysuru": {
        "Mysuru", "Mandya", "Chamarajanagar", "Hassan", "Tumakuru",
        "Bengaluru Urban", "Bengaluru Rural", "Ramanagara", "Kolar",
        "Chikkaballapura",
    },
    "uttara-karnataka": {
        "Belagavi", "Dharwad", "Gadag", "Bagalkot", "Vijayapura",
        "Haveri", "Davangere", "Chitradurga", "Kalaburagi", "Bidar",
        "Yadgir", "Raichur", "Koppal", "Ballari", "Vijayanagara",
    },
    "karavali": {"Dakshina Kannada", "Udupi", "Uttara Kannada"},
    "malenadu-kodagu": {"Kodagu", "Chikkamagaluru", "Shivamogga"},
}
REGIONAL_STORY_TOPICS = {
    "stay", "culture", "communities", "history", "languages", "festivals",
    "performing-arts", "food", "weather", "climate", "nature",
    "architecture", "agriculture", "oral-history", "traditional-knowledge",
    "personalities", "other",
}


def valid_media_signature(extension: str, content: bytes) -> bool:
    if extension in {".jpg", ".jpeg"}:
        return content.startswith(b"\xff\xd8\xff")
    if extension == ".png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if extension == ".webp":
        return (
            len(content) >= 12
            and content.startswith(b"RIFF")
            and content[8:12] == b"WEBP"
        )
    if extension == ".mp4":
        return len(content) >= 12 and content[4:8] == b"ftyp"
    if extension == ".webm":
        return content.startswith(b"\x1a\x45\xdf\xa3")
    return False


BENGALURU_DIVISION_DISTRICTS = {
    "bengaluru-rural",
    "bengaluru-urban",
    "chikkaballapur",
    "chitradurga",
    "davanagere",
    "kolar",
    "ramanagara",
    "shivamogga",
    "tumakuru",
}


def get_db_connection():
    connection = sqlite3.connect(DATABASE_FILE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(post_id, user_id)
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id TEXT NOT NULL,
            contributor TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_id TEXT NOT NULL,
            contributor TEXT NOT NULL,
            rating INTEGER NOT NULL,
            review TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS contributions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            district TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            photograph TEXT,
            contributor TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS place_media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_id TEXT NOT NULL,
            contributor TEXT NOT NULL,
            caption TEXT,
            media_type TEXT NOT NULL,
            url TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS regional_media (
            id TEXT PRIMARY KEY,
            region_id TEXT NOT NULL,
            district TEXT NOT NULL,
            location TEXT NOT NULL,
            contributor TEXT NOT NULL,
            experience TEXT NOT NULL,
            topics_json TEXT NOT NULL,
            filename TEXT,
            media_type TEXT,
            url TEXT,
            permission_confirmed INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'published'
        )
    """)
    connection.execute(
        "CREATE INDEX IF NOT EXISTS idx_regional_media_public "
        "ON regional_media(region_id, status, created_at DESC)"
    )

    review_columns = {
        row["name"] for row in connection.execute("PRAGMA table_info(reviews)")
    }
    if "owner_token_hash" not in review_columns:
        connection.execute("ALTER TABLE reviews ADD COLUMN owner_token_hash TEXT")
    if "status" not in review_columns:
        connection.execute(
            "ALTER TABLE reviews ADD COLUMN status TEXT NOT NULL DEFAULT 'published'"
        )
    if "report_count" not in review_columns:
        connection.execute(
            "ALTER TABLE reviews ADD COLUMN report_count INTEGER NOT NULL DEFAULT 0"
        )

    connection.execute("""
        CREATE TABLE IF NOT EXISTS review_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_id INTEGER NOT NULL,
            reporter_hash TEXT NOT NULL,
            reason TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(review_id, reporter_hash)
        )
    """)
    connection.execute(
        "CREATE INDEX IF NOT EXISTS idx_reviews_place_status_created "
        "ON reviews(place_id, status, created_at)"
    )
    connection.execute(
        "CREATE INDEX IF NOT EXISTS idx_place_media_place_created "
        "ON place_media(place_id, created_at)"
    )

    connection.commit()
    connection.close()


initialize_database()


def read_json(path: Path):
    if not path.exists():
        return []

    try:
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Stored JSON data is invalid: {path.name}.",
        ) from error
    except OSError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Stored JSON data could not be read: {path.name}.",
        ) from error


def write_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)


def community_collection_id(request: Request) -> str:
    if request.url.path.startswith("/api/regions/bengaluru-division/"):
        return "bengaluru-division"
    return "bagalkot"


def validate_community_district(
    request: Request,
    district_id: Optional[str],
) -> Optional[str]:
    if district_id is None:
        return None

    normalized_id = district_id.strip().lower()
    if (
        community_collection_id(request) != "bengaluru-division"
        or normalized_id not in BENGALURU_DIVISION_DISTRICTS
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid Bengaluru division district.",
        )
    return normalized_id


def belongs_to_collection(item: dict, collection_id: str) -> bool:
    return item.get("collection_id", item.get("district_id")) == collection_id


def collection_post_exists(collection_id: str, post_id: str) -> bool:
    return any(
        item.get("id") == post_id and belongs_to_collection(item, collection_id)
        for item in read_json(UPLOADS_FILE)
    )


@app.get("/")
def home():
    return {"message": "LEGACYOS Backend is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/districts")
def get_districts():
    districts = []

    for file_path in DISTRICT_DIR.glob("*.json"):
        with open(file_path, "r", encoding="utf-8-sig") as file:
            data = json.load(file)

        districts.append(data["district"])

    return {
        "count": len(districts),
        "districts": districts
    }


@app.get("/api/districts/{district_id}")
def get_district(district_id: str):
    file_path = DISTRICT_DIR / f"{district_id.lower()}.json"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="District not found")

    with open(file_path, "r", encoding="utf-8-sig") as file:
        return json.load(file)


def _legacy_karavali_media() -> list[dict]:
    district_names = {
        "dakshina-kannada": "Dakshina Kannada",
        "udupi": "Udupi",
        "uttara-kannada": "Uttara Kannada",
    }
    return [
        {
            "id": item["id"],
            "region_id": "karavali",
            "district": district_names[item["district_id"]],
            "location": district_names[item["district_id"]],
            "contributor": item.get("contributor", "Community member"),
            "experience": item.get("caption", ""),
            "topics": [],
            "media_type": item.get("media_type"),
            "url": item.get("url"),
            "created_at": item.get("created_at", ""),
        }
        for item in read_json(UPLOADS_FILE)
        if item.get("district_id") in district_names
        and item.get("status") == "published"
        and item.get("url")
    ]


@app.get("/api/regions/{region_id}/contributions")
def get_region_contributions(region_id: str):
    if region_id not in REGION_DISTRICTS:
        raise HTTPException(status_code=404, detail="Region not found.")

    connection = get_db_connection()
    try:
        rows = connection.execute(
            """
            SELECT id, region_id, district, location, contributor, experience,
                   topics_json, media_type, url, created_at
            FROM regional_media
            WHERE region_id = ? AND status = 'published'
            ORDER BY created_at DESC
            LIMIT 100
            """,
            (region_id,),
        ).fetchall()
    finally:
        connection.close()

    contributions = []
    for row in rows:
        item = dict(row)
        item["topics"] = json.loads(item.pop("topics_json"))
        contributions.append(item)

    if region_id == "karavali":
        contributions.extend(_legacy_karavali_media())
        contributions.sort(
            key=lambda item: item.get("created_at", ""),
            reverse=True,
        )

    return {"contributions": contributions[:100]}


@app.post("/api/regions/{region_id}/contributions")
async def add_region_contribution(
    region_id: str,
    district: str = Form(...),
    location: str = Form(...),
    contributor: str = Form(...),
    experience: str = Form(...),
    topics: str = Form("[]"),
    rights_confirmation: bool = Form(...),
    file: Optional[UploadFile] = File(default=None),
):
    if region_id not in REGION_DISTRICTS:
        raise HTTPException(status_code=404, detail="Region not found.")

    district = district.strip()
    location = location.strip()
    contributor = contributor.strip()
    experience = experience.strip()
    if district not in REGION_DISTRICTS[region_id]:
        raise HTTPException(status_code=400, detail="Choose a district in this region.")
    if not all((location, contributor, experience)):
        raise HTTPException(
            status_code=400,
            detail="Enter your name, visit location, and experience.",
        )
    if (
        len(location) > 160
        or len(contributor) > 80
        or len(experience) > 3000
        or len(topics) > 500
    ):
        raise HTTPException(status_code=400, detail="One or more fields are too long.")
    if not rights_confirmation:
        raise HTTPException(
            status_code=400,
            detail="Confirm that you have permission to share this contribution.",
        )

    try:
        selected_topics = json.loads(topics)
    except json.JSONDecodeError as error:
        raise HTTPException(status_code=400, detail="Invalid topic selection.") from error
    if (
        not isinstance(selected_topics, list)
        or len(selected_topics) > len(REGIONAL_STORY_TOPICS)
        or any(
            not isinstance(topic, str) or topic not in REGIONAL_STORY_TOPICS
            for topic in selected_topics
        )
    ):
        raise HTTPException(status_code=400, detail="Unsupported experience topic.")
    selected_topics = list(dict.fromkeys(selected_topics))

    media_type = None
    media_url = None
    original_name = None
    contribution_id = str(uuid.uuid4())
    saved_path = None
    if file and file.filename:
        original_name = Path(file.filename).name
        extension = Path(original_name).suffix.lower()
        expected_content_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".mp4": "video/mp4",
            ".webm": "video/webm",
        }
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Allowed media: JPG, PNG, WEBP, MP4, or WEBM.",
            )
        if file.content_type != expected_content_types[extension]:
            raise HTTPException(status_code=400, detail="Unsupported media type.")

        try:
            content = await file.read(MAX_FILE_SIZE + 1)
        finally:
            await file.close()
        if not content:
            raise HTTPException(status_code=400, detail="The selected file is empty.")
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="Media exceeds the 100 MB limit.")
        if not valid_media_signature(extension, content):
            raise HTTPException(
                status_code=400,
                detail="The file content does not match its extension.",
            )

        saved_name = f"regional_{contribution_id}{extension}"
        saved_path = UPLOAD_DIR / saved_name
        try:
            saved_path.write_bytes(content)
        except OSError as error:
            raise HTTPException(
                status_code=500, detail="Could not store the uploaded media."
            ) from error
        media_type = "video" if extension in {".mp4", ".webm"} else "image"
        media_url = f"/media/{saved_name}"

    created_at = datetime.now(timezone.utc).isoformat()
    connection = get_db_connection()
    try:
        with connection:
            connection.execute(
                """
                INSERT INTO regional_media (
                    id, region_id, district, location, contributor, experience,
                    topics_json, filename, media_type, url,
                    permission_confirmed, created_at, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
                """,
                (
                    contribution_id,
                    region_id,
                    district,
                    location,
                    contributor,
                    experience,
                    json.dumps(selected_topics, ensure_ascii=False),
                    original_name,
                    media_type,
                    media_url,
                    int(rights_confirmation),
                    created_at,
                ),
            )
    except sqlite3.Error as error:
        if saved_path and saved_path.exists():
            saved_path.unlink()
        raise HTTPException(
            status_code=500,
            detail="Could not save your regional experience.",
        ) from error
    finally:
        connection.close()

    contribution = {
        "id": contribution_id,
        "region_id": region_id,
        "district": district,
        "location": location,
        "contributor": contributor,
        "experience": experience,
        "topics": selected_topics,
        "media_type": media_type,
        "url": media_url,
        "created_at": created_at,
    }
    return {
        "message": "Your regional experience has been added to the archive.",
        "contribution": contribution,
    }


@app.get("/api/districts/bagalkot/community")
@app.get("/api/regions/bengaluru-division/community")
def get_bagalkot_community(
    request: Request,
    district_id: Optional[str] = None,
):
    collection_id = community_collection_id(request)
    district_id = validate_community_district(request, district_id)
    uploads = read_json(UPLOADS_FILE)
    feedback = read_json(FEEDBACK_FILE)

    return {
        "uploads": [
            item for item in uploads
            if belongs_to_collection(item, collection_id)
            and (district_id is None or item.get("district_id") == district_id)
        ],
        "feedback": [
            item for item in feedback
            if belongs_to_collection(item, collection_id)
            and (district_id is None or item.get("district_id") == district_id)
        ]
    }


@app.post("/api/districts/bagalkot/uploads")
@app.post("/api/regions/bengaluru-division/uploads")
async def upload_bagalkot_media(
    request: Request,
    file: UploadFile = File(...),
    contributor: str = Form(...),
    caption: str = Form(""),
    district_id: Optional[str] = Form(None)
):
    collection_id = community_collection_id(request)
    district_id = validate_community_district(request, district_id)
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Allowed files: JPG, JPEG, PNG, WEBP, MP4 and WEBM."
        )

    expected_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
    }

    if file.content_type != expected_types[extension]:
        raise HTTPException(
            status_code=400,
            detail="File content type does not match the file extension."
        )

    contributor = contributor.strip()
    caption = caption.strip()

    if not contributor:
        raise HTTPException(
            status_code=400,
            detail="Please enter your name."
        )

    if len(contributor) > 80 or len(caption) > 500:
        raise HTTPException(
            status_code=400,
            detail="Name or caption is too long."
        )

    content = await file.read(MAX_FILE_SIZE + 1)
    await file.close()

    if not content:
        raise HTTPException(status_code=400, detail="The file is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Maximum upload size is 100 MB."
        )

    if not valid_media_signature(extension, content):

        raise HTTPException(
            status_code=400,
            detail="The file content does not match its extension."
        )

    upload_id = str(uuid.uuid4())
    saved_name = f"{upload_id}{extension}"
    saved_path = UPLOAD_DIR / saved_name

    with open(saved_path, "wb") as destination:
        destination.write(content)

    uploads = read_json(UPLOADS_FILE)

    item = {
        "id": upload_id,
        "district_id": "bagalkot" if collection_id == "bagalkot" else district_id,
        "collection_id": collection_id,
        "contributor": contributor,
        "caption": caption,
        "filename": original_name,
        "media_type": (
            "video" if extension in {".mp4", ".webm"} else "image"
        ),
        "url": f"/media/{saved_name}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "published"
    }
    uploads.insert(0, item)
    write_json(UPLOADS_FILE, uploads)

    return {
        "message": "Your contribution has been published.",
        "upload": item
    }


@app.post("/api/districts/bagalkot/feedback")
@app.post("/api/regions/bengaluru-division/feedback")
def add_bagalkot_feedback(
    request: Request,
    contributor: str = Form(...),
    message: str = Form(...),
    district_id: Optional[str] = Form(None)
):
    collection_id = community_collection_id(request)
    district_id = validate_community_district(request, district_id)
    contributor = contributor.strip()
    message = message.strip()

    if not contributor or not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter your name and feedback."
        )

    if len(contributor) > 80 or len(message) > 2000:
        raise HTTPException(
            status_code=400,
            detail="Your feedback is too long."
        )

    feedback = read_json(FEEDBACK_FILE)

    item = {
        "id": str(uuid.uuid4()),
        "district_id": "bagalkot" if collection_id == "bagalkot" else district_id,
        "collection_id": collection_id,
        "contributor": contributor,
        "message": message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    feedback.insert(0, item)
    write_json(FEEDBACK_FILE, feedback)

    return {
        "message": "Thank you for sharing your feedback.",
        "feedback": item
    }


# Like or unlike a Bagalkot community post
@app.post("/api/districts/bagalkot/posts/{post_id}/like")
@app.post("/api/regions/bengaluru-division/posts/{post_id}/like")
def toggle_post_like(
    request: Request,
    post_id: str,
    user_id: str = Form(...)
):
    collection_id = community_collection_id(request)
    user_id = user_id.strip()

    if not user_id or len(user_id) > 100:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    if not collection_post_exists(collection_id, post_id):
        raise HTTPException(status_code=404, detail="Post not found.")

    connection = get_db_connection()

    existing = connection.execute(
        "SELECT id FROM likes WHERE post_id = ? AND user_id = ?",
        (post_id, user_id)
    ).fetchone()

    if existing:
        connection.execute(
            "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
            (post_id, user_id)
        )
        liked = False
    else:
        connection.execute(
            "INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)",
            (post_id, user_id, datetime.now(timezone.utc).isoformat())
        )
        liked = True

    connection.commit()

    count = connection.execute(
        "SELECT COUNT(*) FROM likes WHERE post_id = ?",
        (post_id,)
    ).fetchone()[0]

    connection.close()

    return {"liked": liked, "likes_count": count}


# Get likes for a post
@app.get("/api/districts/bagalkot/posts/{post_id}/likes")
@app.get("/api/regions/bengaluru-division/posts/{post_id}/likes")
def get_post_likes(request: Request, post_id: str, user_id: str):
    collection_id = community_collection_id(request)
    if not collection_post_exists(collection_id, post_id):
        raise HTTPException(status_code=404, detail="Post not found.")

    connection = get_db_connection()

    count = connection.execute(
        "SELECT COUNT(*) FROM likes WHERE post_id = ?",
        (post_id,)
    ).fetchone()[0]

    existing = connection.execute(
        "SELECT id FROM likes WHERE post_id = ? AND user_id = ?",
        (post_id, user_id)
    ).fetchone()

    connection.close()

    return {
        "likes_count": count,
        "liked": existing is not None
    }


# Add a comment to a Bagalkot community post
@app.post("/api/districts/bagalkot/posts/{post_id}/comments")
@app.post("/api/regions/bengaluru-division/posts/{post_id}/comments")
def add_post_comment(
    request: Request,
    post_id: str,
    contributor: str = Form(...),
    message: str = Form(...)
):
    collection_id = community_collection_id(request)
    contributor = contributor.strip()
    message = message.strip()

    if not contributor or not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter your name and comment."
        )

    if len(contributor) > 80 or len(message) > 1000:
        raise HTTPException(
            status_code=400,
            detail="Name or comment is too long."
        )

    if not collection_post_exists(collection_id, post_id):
        raise HTTPException(status_code=404, detail="Post not found.")

    connection = get_db_connection()

    cursor = connection.execute(
        """INSERT INTO comments
        (post_id, contributor, message, created_at)
        VALUES (?, ?, ?, ?)""",
        (
            post_id,
            contributor,
            message,
            datetime.now(timezone.utc).isoformat()
        )
    )

    connection.commit()

    comment = connection.execute(
        "SELECT * FROM comments WHERE id = ?",
        (cursor.lastrowid,)
    ).fetchone()

    result = dict(comment)
    connection.close()

    return {"message": "Comment added.", "comment": result}


# Get comments for a post
@app.get("/api/districts/bagalkot/posts/{post_id}/comments")
@app.get("/api/regions/bengaluru-division/posts/{post_id}/comments")
def get_post_comments(request: Request, post_id: str):
    collection_id = community_collection_id(request)
    if not collection_post_exists(collection_id, post_id):
        raise HTTPException(status_code=404, detail="Post not found.")

    connection = get_db_connection()

    rows = connection.execute(
        """SELECT * FROM comments
        WHERE post_id = ?
        ORDER BY created_at DESC""",
        (post_id,)
    ).fetchall()

    connection.close()

    return {"comments": [dict(row) for row in rows]}

# Place-specific reviews and ratings
def public_review(row):
    return {
        "id": row["id"],
        "place_id": row["place_id"],
        "contributor": row["contributor"],
        "rating": row["rating"],
        "review": row["review"],
        "created_at": row["created_at"],
    }


def require_existing_place(place_id: str):
    place = find_karavali_place(place_id)
    if place:
        return place

    normalized_id = place_id.casefold()
    for file_path in DISTRICT_DIR.glob("*.json"):
        try:
            with file_path.open("r", encoding="utf-8-sig") as file:
                district_data = json.load(file)
        except json.JSONDecodeError as error:
            raise HTTPException(
                status_code=500,
                detail=f"District data file is invalid: {file_path.name}.",
            ) from error
        except OSError as error:
            raise HTTPException(
                status_code=500,
                detail=f"District data file could not be read: {file_path.name}.",
            ) from error
        for district_place in district_data.get("places", []):
            if district_place.get("id", "").casefold() == normalized_id:
                return district_place

    if not place:
        raise HTTPException(status_code=404, detail="Place not found.")
    return place


def require_existing_karavali_place(place_id: str):
    place = find_karavali_place(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Karavali place not found.")
    return place


def authorize_review_owner(row, authorization: Optional[str]):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Review owner token is required.")
    token = authorization.removeprefix("Bearer ").strip()
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    stored_hash = row["owner_token_hash"] or ""
    if not token or not hmac.compare_digest(token_hash, stored_hash):
        raise HTTPException(status_code=403, detail="This review is not yours to edit.")


@app.get("/api/places/{place_id}/reviews")
def get_place_reviews(place_id: str):
    require_existing_place(place_id)
    connection = get_db_connection()
    rows = connection.execute(
        """SELECT id, place_id, contributor, rating, review, created_at, report_count
           FROM reviews
           WHERE place_id = ? AND status = 'published'
           ORDER BY created_at DESC""",
        (place_id,),
    ).fetchall()
    connection.close()
    reviews = [public_review(row) for row in rows]
    average_rating = (
        sum(review["rating"] for review in reviews) / len(reviews)
        if reviews
        else 0.0
    )
    return {
        "place_id": place_id,
        "average_rating": round(average_rating, 1),
        "total_reviews": len(reviews),
        "reviews": reviews,
    }


@app.post("/api/places/{place_id}/reviews")
def add_place_review(
    place_id: str,
    contributor: str = Form(...),
    rating: int = Form(...),
    review: str = Form(...),
):
    require_existing_place(place_id)
    contributor = contributor.strip()
    review = review.strip()
    if not contributor or not review:
        raise HTTPException(status_code=400, detail="Enter your name and review.")
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    if len(contributor) > 80 or len(review) > 2000:
        raise HTTPException(status_code=400, detail="Name or review is too long.")

    owner_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(owner_token.encode("utf-8")).hexdigest()
    connection = get_db_connection()
    cursor = connection.execute(
        """INSERT INTO reviews
           (place_id, contributor, rating, review, created_at, owner_token_hash,
            status, report_count)
           VALUES (?, ?, ?, ?, ?, ?, 'published', 0)""",
        (
            place_id,
            contributor,
            rating,
            review,
            datetime.now(timezone.utc).isoformat(),
            token_hash,
        ),
    )
    connection.commit()
    row = connection.execute(
        "SELECT * FROM reviews WHERE id = ?", (cursor.lastrowid,)
    ).fetchone()
    connection.close()
    return {
        "message": "Review submitted successfully.",
        "review": public_review(row),
        "owner_token": owner_token,
    }


@app.patch("/api/places/{place_id}/reviews/{review_id}")
def edit_place_review(
    place_id: str,
    review_id: int,
    authorization: Optional[str] = Header(default=None),
    rating: int = Form(...),
    review: str = Form(...),
):
    require_existing_place(place_id)
    review = review.strip()
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    if not review or len(review) > 2000:
        raise HTTPException(status_code=400, detail="Review must contain 1–2000 characters.")

    connection = get_db_connection()
    row = connection.execute(
        "SELECT * FROM reviews WHERE id = ? AND place_id = ?",
        (review_id, place_id),
    ).fetchone()
    if not row:
        connection.close()
        raise HTTPException(status_code=404, detail="Review not found.")
    try:
        authorize_review_owner(row, authorization)
    except HTTPException:
        connection.close()
        raise
    connection.execute(
        "UPDATE reviews SET rating = ?, review = ? WHERE id = ?",
        (rating, review, review_id),
    )
    connection.commit()
    updated = connection.execute(
        "SELECT * FROM reviews WHERE id = ?", (review_id,)
    ).fetchone()
    connection.close()
    return {"message": "Review updated.", "review": public_review(updated)}


@app.delete("/api/places/{place_id}/reviews/{review_id}")
def delete_place_review(
    place_id: str,
    review_id: int,
    authorization: Optional[str] = Header(default=None),
):
    require_existing_place(place_id)
    connection = get_db_connection()
    row = connection.execute(
        "SELECT * FROM reviews WHERE id = ? AND place_id = ?",
        (review_id, place_id),
    ).fetchone()
    if not row:
        connection.close()
        raise HTTPException(status_code=404, detail="Review not found.")
    try:
        authorize_review_owner(row, authorization)
    except HTTPException:
        connection.close()
        raise
    connection.execute("DELETE FROM review_reports WHERE review_id = ?", (review_id,))
    connection.execute(
        "DELETE FROM reviews WHERE id = ? AND place_id = ?", (review_id, place_id)
    )
    connection.commit()
    connection.close()
    return {"message": "Review deleted."}


@app.post("/api/places/{place_id}/reviews/{review_id}/report")
def report_place_review(
    place_id: str,
    review_id: int,
    reporter_id: str = Form(...),
    reason: str = Form(...),
):
    require_existing_place(place_id)
    reporter_id = reporter_id.strip()
    reason = reason.strip()
    if not reporter_id or len(reporter_id) > 160:
        raise HTTPException(status_code=400, detail="A valid reporter identifier is required.")
    if not reason or len(reason) > 500:
        raise HTTPException(status_code=400, detail="Report reason must contain 1–500 characters.")
    connection = get_db_connection()
    row = connection.execute(
        """SELECT id FROM reviews
           WHERE id = ? AND place_id = ? AND status = 'published'""",
        (review_id, place_id),
    ).fetchone()
    if not row:
        connection.close()
        raise HTTPException(status_code=404, detail="Published review not found.")
    reporter_hash = hashlib.sha256(reporter_id.encode("utf-8")).hexdigest()
    cursor = connection.execute(
        """INSERT OR IGNORE INTO review_reports
           (review_id, reporter_hash, reason, created_at)
           VALUES (?, ?, ?, ?)""",
        (
            review_id,
            reporter_hash,
            reason,
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    if cursor.rowcount:
        connection.execute(
            "UPDATE reviews SET report_count = report_count + 1 WHERE id = ?",
            (review_id,),
        )
    connection.commit()
    connection.close()
    return {"message": "Report received."}


@app.get("/api/karavali/categories")
def get_karavali_categories():
    return read_karavali_data("categories.json")


@app.get("/api/karavali/districts")
def get_karavali_districts():
    return {
        "districts": [
            record["district"] for record in get_karavali_district_records()
        ]
    }


@app.get("/api/karavali/districts/{district_id}")
def get_karavali_district(district_id: str):
    normalized_id = district_id.lower()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", normalized_id):
        raise HTTPException(status_code=404, detail="Karavali district not found.")
    district_path = KARAVALI_DATA_DIR / "districts" / f"{normalized_id}.json"
    if not district_path.is_file():
        raise HTTPException(status_code=404, detail="Karavali district not found.")
    return read_karavali_data(f"districts/{normalized_id}.json")


@app.get("/api/karavali/admin/overview")
def get_karavali_admin_overview(
    _: None = Depends(require_karavali_admin),
):
    connection = get_db_connection()
    contribution_counts = {
        row["status"]: row["count"]
        for row in connection.execute(
            "SELECT status, COUNT(*) AS count FROM contributions GROUP BY status"
        ).fetchall()
    }
    review_counts = {
        row["status"]: row["count"]
        for row in connection.execute(
            "SELECT status, COUNT(*) AS count FROM reviews GROUP BY status"
        ).fetchall()
    }
    place_media_count = connection.execute(
        "SELECT COUNT(*) FROM place_media"
    ).fetchone()[0]
    open_report_count = connection.execute(
        "SELECT COUNT(*) FROM review_reports"
    ).fetchone()[0]
    connection.close()

    karavali_district_ids = get_karavali_district_ids()
    published_uploads = [
        item
        for item in read_json(UPLOADS_FILE)
        if item.get("district_id") in karavali_district_ids
        and item.get("status") == "published"
    ]
    categories = read_karavali_data("categories.json").get("categories", [])
    places = load_karavali_places()
    timelines = read_karavali_data("timelines.json").get("timelines", [])
    districts = get_karavali_district_records()
    return {
        "counts": {
            "districts": len(districts),
            "categories": len(categories),
            "places": len(places),
            "timeline_entries": len(timelines),
            "pending_contributions": contribution_counts.get("pending", 0),
            "approved_contributions": contribution_counts.get("approved", 0),
            "published_reviews": review_counts.get("published", 0),
            "hidden_reviews": review_counts.get("hidden", 0),
            "open_review_reports": open_report_count,
            "community_media": place_media_count + len(published_uploads),
        }
    }


@app.get("/api/karavali/places")
def get_karavali_places(
    district: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    if district and district.lower() not in get_karavali_district_ids():
        raise HTTPException(status_code=400, detail="Unknown Karavali district.")
    places = load_karavali_places()
    if district:
        places = [
            place for place in places
            if place["district_id"] == district.lower()
        ]
    if category:
        places = [
            place for place in places
            if place["category"].casefold() == category.casefold()
        ]
    if search:
        query = search.strip().casefold()
        places = [
            place for place in places
            if query in " ".join(
                str(place.get(field, ""))
                for field in ("name", "summary", "description", "category", "district_name")
            ).casefold()
        ]
    return {"count": len(places), "places": places}


@app.get("/api/karavali/places/{place_id}")
def get_karavali_place_detail(place_id: str):
    place = require_existing_karavali_place(place_id)
    sources_by_id = get_karavali_sources()
    place["sources"] = [
        sources_by_id[source_id]
        for source_id in place.get("source_ids", [])
        if source_id in sources_by_id
    ]
    return {
        "place": place,
        "district": {
            "id": place["district_id"],
            "name": place["district_name"],
        },
    }


@app.get("/api/karavali/timelines")
def get_karavali_timelines(district: Optional[str] = None):
    district_names = get_karavali_district_names()
    if district and district.lower() not in district_names:
        raise HTTPException(status_code=400, detail="Unknown Karavali district.")
    timeline_data = read_karavali_data("timelines.json")["timelines"]
    sources_by_id = get_karavali_sources()
    places_by_id = {
        place["id"]: place for place in load_karavali_places()
    }
    timelines = []
    for entry in timeline_data:
        if district and entry["district_id"] != district.lower():
            continue
        place = places_by_id.get(entry.get("place_id"))
        timelines.append({
            **entry,
            "district_name": district_names[entry["district_id"]],
            "place_name": place["name"] if place else None,
            "sources": [
                sources_by_id[source_id]
                for source_id in entry.get("source_ids", [])
                if source_id in sources_by_id
            ],
        })
    return {"timelines": timelines}


@app.get("/api/karavali/admin/categories")
def get_admin_karavali_categories(
    _: None = Depends(require_karavali_admin),
):
    return read_karavali_data("categories.json")


@app.post("/api/karavali/admin/categories", status_code=201)
def create_karavali_category(
    payload: dict = Body(...),
    _: None = Depends(require_karavali_admin),
):
    data = read_karavali_data("categories.json")
    category = normalize_karavali_category(payload)
    if any(item["id"] == category["id"] for item in data["categories"]):
        raise HTTPException(status_code=409, detail="Heritage section already exists.")
    data["categories"].append(category)
    write_karavali_json(KARAVALI_DATA_DIR / "categories.json", data)
    return {"category": category}


@app.put("/api/karavali/admin/categories/{category_id}")
def update_karavali_category(
    category_id: str,
    payload: dict = Body(...),
    _: None = Depends(require_karavali_admin),
):
    data = read_karavali_data("categories.json")
    category_id = karavali_slug(category_id)
    index = next(
        (i for i, item in enumerate(data["categories"]) if item["id"] == category_id),
        None,
    )
    if index is None:
        raise HTTPException(status_code=404, detail="Heritage section not found.")
    category = normalize_karavali_category(payload, category_id)
    data["categories"][index] = category
    write_karavali_json(KARAVALI_DATA_DIR / "categories.json", data)
    return {"category": category}


@app.delete("/api/karavali/admin/categories/{category_id}")
def delete_karavali_category(
    category_id: str,
    _: None = Depends(require_karavali_admin),
):
    category_id = karavali_slug(category_id)
    connection = get_db_connection()
    referenced = connection.execute(
        "SELECT 1 FROM contributions WHERE category = ? LIMIT 1",
        (category_id,),
    ).fetchone()
    connection.close()
    if referenced:
        raise HTTPException(
            status_code=409,
            detail="This section is referenced by community contributions.",
        )
    data = read_karavali_data("categories.json")
    updated = [
        item for item in data["categories"] if item["id"] != category_id
    ]
    if len(updated) == len(data["categories"]):
        raise HTTPException(status_code=404, detail="Heritage section not found.")
    if not updated:
        raise HTTPException(
            status_code=409,
            detail="At least one heritage section must remain.",
        )
    data["categories"] = updated
    write_karavali_json(KARAVALI_DATA_DIR / "categories.json", data)
    return {"message": "Heritage section deleted."}


@app.get("/api/karavali/admin/places")
def get_admin_karavali_places(
    _: None = Depends(require_karavali_admin),
):
    return {"places": load_karavali_places()}


@app.post("/api/karavali/admin/places", status_code=201)
def create_karavali_place(
    payload: dict = Body(...),
    _: None = Depends(require_karavali_admin),
):
    places = load_karavali_places()
    place = normalize_karavali_place(payload)
    if any(item["id"] == place["id"] for item in places):
        raise HTTPException(status_code=409, detail="Karavali place already exists.")
    places.append(place)
    write_karavali_json(KARAVALI_DATA_DIR / "places.json", {"places": places})
    return {"place": place}


@app.put("/api/karavali/admin/places/{place_id}")
def update_karavali_place(
    place_id: str,
    payload: dict = Body(...),
    _: None = Depends(require_karavali_admin),
):
    places = load_karavali_places()
    place_id = karavali_slug(place_id)
    index = next(
        (i for i, item in enumerate(places) if item["id"] == place_id),
        None,
    )
    if index is None:
        raise HTTPException(status_code=404, detail="Karavali place not found.")
    place = normalize_karavali_place(payload, place_id)
    places[index] = place
    write_karavali_json(KARAVALI_DATA_DIR / "places.json", {"places": places})
    return {"place": place}


@app.delete("/api/karavali/admin/places/{place_id}")
def delete_karavali_place(
    place_id: str,
    _: None = Depends(require_karavali_admin),
):
    place_id = karavali_slug(place_id)
    timelines = read_karavali_data("timelines.json")["timelines"]
    if any(item.get("place_id") == place_id for item in timelines):
        raise HTTPException(
            status_code=409,
            detail="This place is referenced by a timeline entry.",
        )
    connection = get_db_connection()
    linked_records = (
        connection.execute(
            "SELECT 1 FROM reviews WHERE place_id = ? LIMIT 1", (place_id,)
        ).fetchone()
        or connection.execute(
            "SELECT 1 FROM place_media WHERE place_id = ? LIMIT 1", (place_id,)
        ).fetchone()
    )
    connection.close()
    if linked_records:
        raise HTTPException(
            status_code=409,
            detail="This place has community reviews or media and cannot be deleted.",
        )
    places = load_karavali_places()
    updated = [place for place in places if place["id"] != place_id]
    if len(updated) == len(places):
        raise HTTPException(status_code=404, detail="Karavali place not found.")
    write_karavali_json(KARAVALI_DATA_DIR / "places.json", {"places": updated})
    return {"message": "Karavali place deleted."}


@app.get("/api/karavali/admin/timelines")
def get_admin_karavali_timelines(
    _: None = Depends(require_karavali_admin),
):
    return read_karavali_data("timelines.json")


@app.post("/api/karavali/admin/timelines", status_code=201)
def create_karavali_timeline(
    payload: dict = Body(...),
    _: None = Depends(require_karavali_admin),
):
    data = read_karavali_data("timelines.json")
    entry = normalize_karavali_timeline(payload)
    if any(item["id"] == entry["id"] for item in data["timelines"]):
        raise HTTPException(status_code=409, detail="Timeline entry already exists.")
    data["timelines"].append(entry)
    data["timelines"].sort(key=lambda item: item["sort_order"])
    write_karavali_json(KARAVALI_DATA_DIR / "timelines.json", data)
    return {"timeline": entry}


@app.put("/api/karavali/admin/timelines/{timeline_id}")
def update_karavali_timeline(
    timeline_id: str,
    payload: dict = Body(...),
    _: None = Depends(require_karavali_admin),
):
    data = read_karavali_data("timelines.json")
    timeline_id = karavali_slug(timeline_id)
    index = next(
        (i for i, item in enumerate(data["timelines"]) if item["id"] == timeline_id),
        None,
    )
    if index is None:
        raise HTTPException(status_code=404, detail="Timeline entry not found.")
    entry = normalize_karavali_timeline(payload, timeline_id)
    data["timelines"][index] = entry
    data["timelines"].sort(key=lambda item: item["sort_order"])
    write_karavali_json(KARAVALI_DATA_DIR / "timelines.json", data)
    return {"timeline": entry}


@app.delete("/api/karavali/admin/timelines/{timeline_id}")
def delete_karavali_timeline(
    timeline_id: str,
    _: None = Depends(require_karavali_admin),
):
    timeline_id = karavali_slug(timeline_id)
    data = read_karavali_data("timelines.json")
    updated = [
        item for item in data["timelines"] if item["id"] != timeline_id
    ]
    if len(updated) == len(data["timelines"]):
        raise HTTPException(status_code=404, detail="Timeline entry not found.")
    data["timelines"] = updated
    write_karavali_json(KARAVALI_DATA_DIR / "timelines.json", data)
    return {"message": "Timeline entry deleted."}


@app.get("/api/karavali/admin/districts")
def get_admin_karavali_districts(
    _: None = Depends(require_karavali_admin),
):
    return get_karavali_districts()


@app.post("/api/karavali/admin/districts", status_code=201)
def create_karavali_district(
    payload: dict = Body(...),
    _: None = Depends(require_karavali_admin),
):
    district = normalize_karavali_district(payload)
    district_path = (
        KARAVALI_DATA_DIR / "districts" / f"{district['id']}.json"
    )
    if district_path.exists():
        raise HTTPException(status_code=409, detail="Karavali district already exists.")
    record = {
        "district": district,
        "records": [],
        "places": [],
        "media_references": [],
        "future_research": [],
    }
    write_karavali_json(district_path, record)
    return {"district": district}


@app.put("/api/karavali/admin/districts/{district_id}")
def update_karavali_district(
    district_id: str,
    payload: dict = Body(...),
    _: None = Depends(require_karavali_admin),
):
    district_id = karavali_slug(district_id)
    district_path = KARAVALI_DATA_DIR / "districts" / f"{district_id}.json"
    if not district_path.is_file():
        raise HTTPException(status_code=404, detail="Karavali district not found.")
    record = read_karavali_data(f"districts/{district_id}.json")
    district = normalize_karavali_district(payload, district_id)
    record["district"] = district
    write_karavali_json(district_path, record)
    return {"district": district}


@app.delete("/api/karavali/admin/districts/{district_id}")
def delete_karavali_district(
    district_id: str,
    _: None = Depends(require_karavali_admin),
):
    district_id = karavali_slug(district_id)
    district_path = KARAVALI_DATA_DIR / "districts" / f"{district_id}.json"
    if not district_path.is_file():
        raise HTTPException(status_code=404, detail="Karavali district not found.")
    linked_places = any(
        place["district_id"] == district_id for place in load_karavali_places()
    )
    linked_timelines = any(
        entry["district_id"] == district_id
        for entry in read_karavali_data("timelines.json")["timelines"]
    )
    connection = get_db_connection()
    linked_contributions = connection.execute(
        "SELECT 1 FROM contributions WHERE district = ? LIMIT 1",
        (district_id,),
    ).fetchone()
    connection.close()
    linked_uploads = any(
        upload.get("district_id") == district_id
        for upload in read_json(UPLOADS_FILE)
    )
    if linked_places or linked_timelines or linked_contributions or linked_uploads:
        raise HTTPException(
            status_code=409,
            detail="Remove linked places, timeline entries, contributions, and media before deleting this district.",
        )
    district_path.unlink()
    return {"message": "Karavali district deleted."}


@app.get("/api/karavali/contributions")
def get_karavali_contributions(
    district: Optional[str] = None,
    category: Optional[str] = None,
):
    if district and district.lower() not in get_karavali_district_ids():
        raise HTTPException(status_code=400, detail="Unknown Karavali district.")
    connection = get_db_connection()
    query = "SELECT * FROM contributions WHERE status = 'approved'"
    params = []
    if district:
        query += " AND district = ?"
        params.append(district.lower())
    if category:
        query += " AND category = ?"
        params.append(category)
    query += " ORDER BY created_at DESC"
    rows = connection.execute(query, params).fetchall()
    connection.close()
    return {"contributions": [dict(row) for row in rows]}


@app.post("/api/karavali/contributions")
async def submit_karavali_contribution(
    title: str = Form(...),
    category: str = Form(...),
    district: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    contributor: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    title = title.strip()
    category = category.strip()
    district = district.strip().lower()
    location = location.strip()
    description = description.strip()
    contributor = contributor.strip()
    if not all((title, category, district, location, description, contributor)):
        raise HTTPException(status_code=400, detail="All required fields must be filled.")
    if district not in get_karavali_district_ids():
        raise HTTPException(status_code=400, detail="Choose a Karavali district.")
    if (
        len(title) > 120
        or len(category) > 100
        or len(location) > 160
        or len(description) > 3000
        or len(contributor) > 80
    ):
        raise HTTPException(status_code=400, detail="One or more fields exceed the allowed length.")

    photograph_url = None
    if file and file.filename:
        extension = Path(file.filename).suffix.lower()
        allowed_images = {".jpg", ".jpeg", ".png", ".webp"}
        expected_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
        }
        if extension not in allowed_images or file.content_type != expected_types[extension]:
            raise HTTPException(status_code=400, detail="Upload a valid JPG, PNG, or WEBP image.")
        content = await file.read(MAX_FILE_SIZE + 1)
        await file.close()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="Image exceeds the 100 MB limit.")
        if not content or not valid_media_signature(extension, content):
            raise HTTPException(status_code=400, detail="Uploaded image content is invalid.")
        saved_name = f"contrib_{uuid.uuid4()}{extension}"
        (UPLOAD_DIR / saved_name).write_bytes(content)
        photograph_url = f"/media/{saved_name}"

    connection = get_db_connection()
    connection.execute(
        """INSERT INTO contributions
           (title, category, district, location, description, photograph,
            contributor, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)""",
        (
            title,
            category,
            district,
            location,
            description,
            photograph_url,
            contributor,
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    connection.commit()
    connection.close()
    return {
        "message": "Contribution submitted successfully. It will be published after admin review."
    }


@app.get("/api/karavali/admin/contributions")
def get_admin_contributions(
    _: None = Depends(require_karavali_admin),
):
    connection = get_db_connection()
    rows = connection.execute(
        "SELECT * FROM contributions ORDER BY created_at DESC"
    ).fetchall()
    connection.close()
    return {"contributions": [dict(row) for row in rows]}


@app.post("/api/karavali/admin/contributions/{contrib_id}/approve")
def approve_contribution(
    contrib_id: int,
    _: None = Depends(require_karavali_admin),
):
    connection = get_db_connection()
    cursor = connection.execute(
        "UPDATE contributions SET status = 'approved' WHERE id = ?",
        (contrib_id,),
    )
    connection.commit()
    connection.close()
    if not cursor.rowcount:
        raise HTTPException(status_code=404, detail="Contribution not found.")
    return {"message": "Contribution approved successfully."}


@app.delete("/api/karavali/admin/contributions/{contrib_id}")
def delete_contribution(
    contrib_id: int,
    _: None = Depends(require_karavali_admin),
):
    connection = get_db_connection()
    cursor = connection.execute(
        "DELETE FROM contributions WHERE id = ?", (contrib_id,)
    )
    connection.commit()
    connection.close()
    if not cursor.rowcount:
        raise HTTPException(status_code=404, detail="Contribution not found.")
    return {"message": "Contribution deleted successfully."}


@app.get("/api/karavali/admin/review-reports")
def get_admin_review_reports(
    _: None = Depends(require_karavali_admin),
):
    connection = get_db_connection()
    rows = connection.execute(
        """SELECT reports.id, reports.review_id, reports.reason, reports.created_at,
                  reviews.place_id, reviews.contributor, reviews.review
           FROM review_reports AS reports
           JOIN reviews ON reviews.id = reports.review_id
           ORDER BY reports.created_at DESC"""
    ).fetchall()
    connection.close()
    return {"reports": [dict(row) for row in rows]}


@app.delete("/api/karavali/admin/review-reports/{report_id}")
def dismiss_review_report(
    report_id: int,
    _: None = Depends(require_karavali_admin),
):
    connection = get_db_connection()
    report = connection.execute(
        "SELECT review_id FROM review_reports WHERE id = ?", (report_id,)
    ).fetchone()
    if not report:
        connection.close()
        raise HTTPException(status_code=404, detail="Review report not found.")
    connection.execute("DELETE FROM review_reports WHERE id = ?", (report_id,))
    connection.execute(
        """UPDATE reviews
           SET report_count = MAX(report_count - 1, 0)
           WHERE id = ?""",
        (report["review_id"],),
    )
    connection.commit()
    connection.close()
    return {"message": "Report dismissed."}


@app.post("/api/karavali/admin/reviews/{review_id}/hide")
def hide_reported_review(
    review_id: int,
    _: None = Depends(require_karavali_admin),
):
    connection = get_db_connection()
    cursor = connection.execute(
        "UPDATE reviews SET status = 'hidden', report_count = 0 WHERE id = ?",
        (review_id,),
    )
    if not cursor.rowcount:
        connection.close()
        raise HTTPException(status_code=404, detail="Review not found.")
    connection.execute(
        "DELETE FROM review_reports WHERE review_id = ?", (review_id,)
    )
    connection.commit()
    connection.close()
    return {"message": "Review hidden from public view."}


@app.get("/api/places/{place_id}/media")
def get_place_media(place_id: str):
    require_existing_place(place_id)
    connection = get_db_connection()
    rows = connection.execute(
        """SELECT * FROM place_media
           WHERE place_id = ?
           ORDER BY created_at DESC""",
        (place_id,),
    ).fetchall()
    connection.close()
    return {"media": [dict(row) for row in rows]}


@app.post("/api/places/{place_id}/media")
async def upload_place_media(
    place_id: str,
    file: UploadFile = File(...),
    contributor: str = Form(...),
    caption: str = Form(""),
):
    require_existing_place(place_id)
    contributor = contributor.strip()
    caption = caption.strip()
    if not contributor or len(contributor) > 80:
        raise HTTPException(status_code=400, detail="Enter a name of at most 80 characters.")
    if len(caption) > 500:
        raise HTTPException(status_code=400, detail="Caption must be at most 500 characters.")
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()
    expected_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
    }
    if extension not in expected_types or file.content_type != expected_types[extension]:
        raise HTTPException(
            status_code=400,
            detail="Allowed media: JPG, JPEG, PNG, WEBP, MP4, or WEBM.",
        )
    content = await file.read(MAX_FILE_SIZE + 1)
    await file.close()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Media exceeds the 100 MB limit.")
    if not content or not valid_media_signature(extension, content):
        raise HTTPException(status_code=400, detail="Uploaded media content is invalid.")

    saved_name = f"place_{uuid.uuid4()}{extension}"
    (UPLOAD_DIR / saved_name).write_bytes(content)
    media_type = "video" if extension in {".mp4", ".webm"} else "image"
    url = f"/media/{saved_name}"
    connection = get_db_connection()
    cursor = connection.execute(
        """INSERT INTO place_media
           (place_id, contributor, caption, media_type, url, created_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            place_id,
            contributor,
            caption,
            media_type,
            url,
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    connection.commit()
    row = connection.execute(
        "SELECT * FROM place_media WHERE id = ?", (cursor.lastrowid,)
    ).fetchone()
    connection.close()
    return {"message": "Media uploaded successfully.", "media": dict(row)}


app.mount(
    "/media",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="media"
)
