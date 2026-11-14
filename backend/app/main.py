

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional
import json
import uuid
import shutil
import sqlite3
from app.knowledge_base import router as knowledge_router

app = FastAPI(
    title="LEGACYOS API",
    description="Human Knowledge Preservation System",
    version="1.0.0"
)
app.include_router(knowledge_router)

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

# Backend folders
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DISTRICT_DIR = DATA_DIR / "districts"
UPLOAD_DIR = DATA_DIR / "uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DISTRICT_DIR.mkdir(parents=True, exist_ok=True)

UPLOADS_FILE = DATA_DIR / "uploads.json"
FEEDBACK_FILE = DATA_DIR / "feedback.json"

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp",
    ".mp4", ".webm"
}

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

# SQLite database for community interactions
DATABASE_FILE = DATA_DIR / "community.db"


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

    connection.commit()
    connection.close()


initialize_database()


def read_json(path: Path):
    if not path.exists():
        return []

    try:
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return []


def write_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)


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


@app.get("/api/districts/bagalkot/community")
def get_bagalkot_community():
    uploads = read_json(UPLOADS_FILE)
    feedback = read_json(FEEDBACK_FILE)

    return {
        "uploads": [
            item for item in uploads
            if item.get("district_id") == "bagalkot"
        ],
        "feedback": [
            item for item in feedback
            if item.get("district_id") == "bagalkot"
        ]
    }


@app.post("/api/districts/bagalkot/uploads")
async def upload_bagalkot_media(
    file: UploadFile = File(...),
    contributor: str = Form(...),
    caption: str = Form("")
):
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Allowed files: JPG, JPEG, PNG, WEBP, MP4 and WEBM."
        )

    content_type = file.content_type or ""

    allowed_types = {
        "image/jpeg", "image/png", "image/webp",
        "video/mp4", "video/webm"
    }

    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type."
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

    if not content:
        raise HTTPException(status_code=400, detail="The file is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Maximum upload size is 100 MB."
        )

    # Basic file-signature checks
    valid_signature = False

    if extension in {".jpg", ".jpeg"}:
        valid_signature = content.startswith(b"\xff\xd8\xff")
    elif extension == ".png":
        valid_signature = content.startswith(b"\x89PNG\r\n\x1a\n")
    elif extension == ".webp":
        valid_signature = (
            len(content) >= 12
            and content.startswith(b"RIFF")
            and content[8:12] == b"WEBP"
        )
    elif extension == ".mp4":
        valid_signature = len(content) >= 12 and content[4:8] == b"ftyp"
    elif extension == ".webm":
        valid_signature = content.startswith(b"\x1a\x45\xdf\xa3")

    if not valid_signature:
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
        "district_id": "bagalkot",
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
def add_bagalkot_feedback(
    contributor: str = Form(...),
    message: str = Form(...)
):
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
        "district_id": "bagalkot",
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
def toggle_post_like(
    post_id: str,
    user_id: str = Form(...)
):
    user_id = user_id.strip()

    if not user_id or len(user_id) > 100:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    uploads = read_json(UPLOADS_FILE)

    if not any(
        item.get("id") == post_id
        and item.get("district_id") == "bagalkot"
        for item in uploads
    ):
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
def get_post_likes(post_id: str, user_id: str):
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
def add_post_comment(
    post_id: str,
    contributor: str = Form(...),
    message: str = Form(...)
):
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

    uploads = read_json(UPLOADS_FILE)

    if not any(
        item.get("id") == post_id
        and item.get("district_id") == "bagalkot"
        for item in uploads
    ):
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
def get_post_comments(post_id: str):
    connection = get_db_connection()

    rows = connection.execute(
        """SELECT * FROM comments
        WHERE post_id = ?
        ORDER BY created_at DESC""",
        (post_id,)
    ).fetchall()

    connection.close()

    return {"comments": [dict(row) for row in rows]}

# Publicly serve uploaded media

app.mount(
    "/media",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="media"
)
