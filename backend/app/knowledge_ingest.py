from __future__ import annotations

import argparse
import hashlib
import json
import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse

from app.knowledge_base import REGION_DISTRICTS

logger = logging.getLogger(__name__)

INDEX_PATH = Path(__file__).resolve().parents[1] / "data" / "knowledge_index.sqlite3"
TARGET_REGIONS = frozenset(
    {"old-mysuru", "uttara-karnataka", "malenadu-kodagu"}
)
REQUIRED_FIELDS = (
    "id",
    "title",
    "content",
    "region",
    "category",
    "subcategory",
    "source_url",
    "source_title",
    "source_org",
    "extraction_date",
    "uncertainty",
    "additional_sources",
    "language",
    "verification_status",
    "keywords",
)


def _record_hash(record: dict[str, Any]) -> str:
    canonical = json.dumps(record, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _validate_record(record: Any) -> dict[str, Any]:
    if not isinstance(record, dict):
        raise ValueError("record must be a JSON object")

    missing = [
        field for field in REQUIRED_FIELDS
        if field not in record or record[field] is None
    ]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")

    for field in REQUIRED_FIELDS:
        if field != "additional_sources" and not isinstance(record[field], str):
            raise ValueError(f"{field} must be a string")
    if any(
        not record[field].strip()
        for field in REQUIRED_FIELDS
        if field not in {"additional_sources", "uncertainty"}
    ):
        raise ValueError("required text fields cannot be blank")

    region = record["region"]
    if region not in TARGET_REGIONS:
        raise ValueError("only new Old Mysuru, Uttara Karnataka, and Malenadu & Kodagu records may be ingested")
    district = record.get("district")
    if district and district not in REGION_DISTRICTS[region]:
        raise ValueError(f"district {district!r} does not belong to {region}")
    if record["verification_status"] != "verified":
        raise ValueError("only source-verified records may be indexed")
    if not record["source_url"].startswith(("https://", "http://")):
        raise ValueError("source_url must be an HTTP(S) URL")
    if not urlparse(record["source_url"]).netloc:
        raise ValueError("source_url must include a host")
    if not isinstance(record["additional_sources"], (list, dict, str)):
        raise ValueError("additional_sources must be a JSON-compatible value")

    return record


def _load_jsonl(path: Path) -> tuple[list[dict[str, Any]], int]:
    records = []
    failures = 0
    with path.open("r", encoding="utf-8") as source:
        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError as error:
                logger.error("Skipping malformed JSON on line %d: %s", line_number, error)
                failures += 1
                continue
            records.append(record)
    return records, failures


def ingest_records(
    index_path: Path,
    records: Iterable[dict[str, Any]],
    *,
    rebuild_search: bool = False,
) -> dict[str, int]:
    summary = {"inserted": 0, "duplicates": 0, "failed": 0, "reindexed": 0}
    connection = sqlite3.connect(index_path, timeout=10)
    try:
        with connection:
            for record_number, raw_record in enumerate(records, start=1):
                try:
                    record = _validate_record(raw_record)
                except (TypeError, ValueError) as error:
                    logger.error("Record %d rejected: %s", record_number, error)
                    summary["failed"] += 1
                    continue

                data = dict(record)
                data["district"] = data.get("district") or None
                data["publication_year"] = data.get("publication_year") or None
                data["reporting_year"] = data.get("reporting_year") or None
                data["accessed_at"] = data.get("accessed_at") or datetime.now(
                    timezone.utc
                ).isoformat()
                data["additional_sources"] = json.dumps(
                    data["additional_sources"],
                    ensure_ascii=False,
                    sort_keys=True,
                )
                data["record_hash"] = _record_hash(record)

                existing_id = connection.execute(
                    "SELECT 1 FROM knowledge_documents WHERE id = ?",
                    (data["id"],),
                ).fetchone()
                existing_source = connection.execute(
                    """
                    SELECT 1 FROM knowledge_documents
                    WHERE region = ? AND district IS ? AND source_url = ?
                      AND lower(title) = lower(?)
                    """,
                    (
                        data["region"],
                        data["district"],
                        data["source_url"],
                        data["title"],
                    ),
                ).fetchone()
                if existing_id or existing_source:
                    logger.info("Skipping duplicate record %s", data["id"])
                    summary["duplicates"] += 1
                    continue

                connection.execute(
                    """
                    INSERT INTO knowledge_documents (
                        id, title, content, region, district, category, subcategory,
                        source_url, source_title, source_org, publication_year,
                        reporting_year, accessed_at, extraction_date, uncertainty,
                        additional_sources, language, verification_status, keywords,
                        record_hash
                    ) VALUES (
                        :id, :title, :content, :region, :district, :category,
                        :subcategory, :source_url, :source_title, :source_org,
                        :publication_year, :reporting_year, :accessed_at,
                        :extraction_date, :uncertainty, :additional_sources,
                        :language, :verification_status, :keywords, :record_hash
                    )
                    """,
                    data,
                )
                connection.execute(
                    """
                    INSERT INTO knowledge_search
                        (doc_id, title, content, keywords, region, district, category)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        data["id"],
                        data["title"],
                        data["content"],
                        data["keywords"],
                        data["region"],
                        data["district"] or "",
                        data["category"],
                    ),
                )
                logger.info("Indexed %s (%s/%s)", data["id"], data["region"], data["district"])
                summary["inserted"] += 1

            if rebuild_search:
                connection.execute("DELETE FROM knowledge_search")
                connection.execute(
                    """
                    INSERT INTO knowledge_search
                        (doc_id, title, content, keywords, region, district, category)
                    SELECT id, title, content, keywords, region,
                           coalesce(district, ''), category
                    FROM knowledge_documents
                    """
                )
                summary["reindexed"] = connection.execute(
                    "SELECT COUNT(*) FROM knowledge_documents"
                ).fetchone()[0]
                logger.info("Rebuilt full-text index for %d documents", summary["reindexed"])

            indexed_at = datetime.now(timezone.utc).isoformat()
            corpus_hash = hashlib.sha256(
                "\n".join(
                    row[0]
                    for row in connection.execute(
                        "SELECT record_hash FROM knowledge_documents ORDER BY id"
                    )
                ).encode("utf-8")
            ).hexdigest()
            connection.execute(
                """
                INSERT INTO knowledge_metadata (key, value)
                VALUES ('last_indexed_at', ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
                """,
                (indexed_at,),
            )
            connection.execute(
                """
                INSERT INTO knowledge_metadata (key, value)
                VALUES ('corpus_hash', ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
                """,
                (corpus_hash,),
            )
    finally:
        connection.close()

    logger.info(
        "Ingestion complete: %d inserted, %d duplicates, %d failed, %d reindexed",
        summary["inserted"],
        summary["duplicates"],
        summary["failed"],
        summary["reindexed"],
    )
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Incrementally ingest verified regional records into the SARVAM index."
    )
    parser.add_argument("--input", type=Path, help="UTF-8 JSONL records to ingest")
    parser.add_argument(
        "--index",
        type=Path,
        default=INDEX_PATH,
        help="SQLite index path (defaults to backend/data/knowledge_index.sqlite3)",
    )
    parser.add_argument(
        "--rebuild-search",
        action="store_true",
        help="rebuild the FTS index for all existing documents",
    )
    args = parser.parse_args()
    if args.input is None and not args.rebuild_search:
        parser.error("provide --input, --rebuild-search, or both")

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    records: list[dict[str, Any]] = []
    failures = 0
    if args.input is not None:
        records, failures = _load_jsonl(args.input)
    summary = ingest_records(args.index, records, rebuild_search=args.rebuild_search)
    return 1 if failures or summary["failed"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
