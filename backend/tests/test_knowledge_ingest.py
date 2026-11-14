import sqlite3

from app.knowledge_ingest import ingest_records


def _create_index(path):
    with sqlite3.connect(path) as connection:
        connection.executescript(
            """
            CREATE TABLE knowledge_documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                region TEXT NOT NULL,
                district TEXT,
                category TEXT NOT NULL,
                subcategory TEXT NOT NULL,
                source_url TEXT NOT NULL,
                source_title TEXT NOT NULL,
                source_org TEXT NOT NULL,
                publication_year TEXT,
                reporting_year TEXT,
                accessed_at TEXT NOT NULL,
                extraction_date TEXT NOT NULL,
                uncertainty TEXT NOT NULL,
                additional_sources TEXT NOT NULL,
                language TEXT NOT NULL,
                verification_status TEXT NOT NULL,
                keywords TEXT NOT NULL,
                record_hash TEXT NOT NULL
            );
            CREATE VIRTUAL TABLE knowledge_search USING fts5(
                doc_id UNINDEXED, title, content, keywords,
                region UNINDEXED, district UNINDEXED, category UNINDEXED
            );
            CREATE TABLE knowledge_metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            """
        )
        connection.execute(
            """
            INSERT INTO knowledge_documents (
                id, title, content, region, district, category, subcategory,
                source_url, source_title, source_org, publication_year,
                reporting_year, accessed_at, extraction_date, uncertainty,
                additional_sources, language, verification_status, keywords,
                record_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "karavali-existing",
                "Existing coastal record",
                "Existing Karavali knowledge must remain unchanged.",
                "karavali",
                "udupi",
                "culture",
                "heritage",
                "https://example.gov.in/karavali",
                "Existing source",
                "District Administration",
                None,
                None,
                "2026-01-01",
                "2026-01-01",
                "",
                "[]",
                "en",
                "verified",
                "karavali existing",
                "karavali-hash",
            ),
        )
        connection.execute(
            """
            INSERT INTO knowledge_search
                (doc_id, title, content, keywords, region, district, category)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "karavali-existing",
                "Existing coastal record",
                "Existing Karavali knowledge must remain unchanged.",
                "karavali existing",
                "karavali",
                "udupi",
                "culture",
            ),
        )
        connection.executemany(
            "INSERT INTO knowledge_metadata (key, value) VALUES (?, ?)",
            (("corpus_hash", "old-hash"), ("last_indexed_at", "2026-01-01")),
        )


def _record(record_id="mysuru-ragi"):
    return {
        "id": record_id,
        "title": "Ragi in Mysuru",
        "content": "The district source lists ragi as a crop grown in Mysuru.",
        "region": "old-mysuru",
        "district": "mysuru",
        "category": "agriculture",
        "subcategory": "crops",
        "source_url": "https://example.gov.in/mysuru/agriculture",
        "source_title": "Mysuru district agriculture",
        "source_org": "District Administration",
        "publication_year": None,
        "reporting_year": "2023-24",
        "extraction_date": "2026-11-14",
        "uncertainty": "",
        "additional_sources": [],
        "language": "en",
        "verification_status": "verified",
        "keywords": "ragi crop agriculture Mysuru Old Mysuru",
    }


def test_ingestion_is_incremental_and_preserves_karavali(tmp_path):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(index_path)

    first = ingest_records(index_path, [_record()])
    second = ingest_records(index_path, [_record()])

    assert first["inserted"] == 1
    assert second["duplicates"] == 1
    with sqlite3.connect(index_path) as connection:
        assert connection.execute(
            "SELECT content FROM knowledge_documents WHERE id = 'karavali-existing'"
        ).fetchone()[0] == "Existing Karavali knowledge must remain unchanged."
        assert connection.execute(
            "SELECT count(*) FROM knowledge_documents WHERE region = 'karavali'"
        ).fetchone()[0] == 1
        assert connection.execute(
            "SELECT doc_id FROM knowledge_search WHERE knowledge_search MATCH 'ragi'"
        ).fetchone()[0] == "mysuru-ragi"
        assert connection.execute(
            "SELECT value FROM knowledge_metadata WHERE key = 'corpus_hash'"
        ).fetchone()[0] != "old-hash"


def test_ingestion_rejects_karavali_and_rebuilds_full_search_index(tmp_path):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(index_path)
    karavali_record = _record("karavali-new")
    karavali_record["region"] = "karavali"
    karavali_record["district"] = "udupi"

    result = ingest_records(
        index_path,
        [karavali_record],
        rebuild_search=True,
    )

    assert result["failed"] == 1
    assert result["reindexed"] == 1
    with sqlite3.connect(index_path) as connection:
        assert connection.execute(
            "SELECT count(*) FROM knowledge_documents WHERE region = 'karavali'"
        ).fetchone()[0] == 1
        assert connection.execute(
            "SELECT doc_id FROM knowledge_search WHERE knowledge_search MATCH 'coastal'"
        ).fetchone()[0] == "karavali-existing"
