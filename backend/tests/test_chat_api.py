import sqlite3

from fastapi.testclient import TestClient

import app.knowledge_base as knowledge_base
from app.main import app


def _create_index(path, records):
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
                uncertainty TEXT NOT NULL,
                verification_status TEXT NOT NULL
            );
            CREATE VIRTUAL TABLE knowledge_search USING fts5(
                doc_id UNINDEXED, title, content, keywords,
                region UNINDEXED, district UNINDEXED, category UNINDEXED
            );
            CREATE TABLE knowledge_embeddings (
                doc_id TEXT PRIMARY KEY,
                model_name TEXT NOT NULL,
                record_hash TEXT NOT NULL,
                vector_json TEXT NOT NULL
            );
            """
        )
        for record in records:
            connection.execute(
                """
                INSERT INTO knowledge_documents (
                    id, title, content, region, district, category, subcategory,
                    source_url, source_title, source_org, publication_year,
                    reporting_year, uncertainty, verification_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record["id"],
                    record["title"],
                    record["content"],
                    record["region"],
                    record["district"],
                    record["category"],
                    record.get("subcategory", ""),
                    record["source_url"],
                    record["source_title"],
                    record["source_org"],
                    record.get("publication_year"),
                    record.get("reporting_year"),
                    record.get("uncertainty", ""),
                    record.get("verification_status", "verified"),
                ),
            )
            connection.execute(
                """
                INSERT INTO knowledge_search
                    (doc_id, title, content, keywords, region, district, category)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record["id"],
                    record["title"],
                    record["content"],
                    record.get("keywords", ""),
                    record["region"],
                    record["district"] or "",
                    record["category"],
                ),
            )


def _record(record_id, region, district, title, content, category="agriculture"):
    return {
        "id": record_id,
        "title": title,
        "content": content,
        "region": region,
        "district": district,
        "category": category,
        "source_url": f"https://example.gov.in/{record_id}",
        "source_title": "Official district profile",
        "source_org": "District Administration",
        "keywords": f"{region} {district or ''} {category}",
    }


def _unexpected_model_request(*args, **kwargs):
    raise AssertionError(f"Unexpected model request: {args!r}, {kwargs!r}")


def test_chat_uses_existing_fts_index_and_returns_citations(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "udupi-yakshagana",
                "karavali",
                "udupi",
                "Yakshagana in Udupi",
                "Yakshagana combines song, percussion, dialogue, costume, and dance.",
                category="culture",
            ),
            _record(
                "mysuru-yakshagana",
                "old-mysuru",
                "mysuru",
                "Yakshagana performance",
                "Yakshagana is described in this separate regional record.",
                category="culture",
            ),
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [{"role": "user", "content": "Tell me about Yakshagana"}],
            "region": "Karavali",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["mode"] == "extractive"
    assert "song, percussion" in result["answer"]
    assert [source["document_id"] for source in result["sources"]] == [
        "udupi-yakshagana"
    ]
    assert result["sources"][0]["source_url"] == "https://example.gov.in/udupi-yakshagana"
    assert result["sources"][0]["internal_url"] == "/districts/udupi"


def test_district_name_filters_out_other_regions(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "mysuru-ragi",
                "old-mysuru",
                "mysuru",
                "Ragi cultivation in Mysuru",
                "The Mysuru district record identifies ragi as a crop grown there.",
            ),
            _record(
                "udupi-ragi",
                "karavali",
                "udupi",
                "Ragi cultivation in Udupi",
                "The Udupi district record identifies ragi as a crop grown there.",
            ),
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "What crops are grown in Mysuru district?"}
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert [source["document_id"] for source in result["sources"]] == [
        "mysuru-ragi"
    ]


def test_region_name_does_not_narrow_to_same_named_district(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "mysuru-ragi",
                "old-mysuru",
                "mysuru",
                "Ragi cultivation in Mysuru",
                "Ragi is cultivated in the Mysuru district.",
            ),
            _record(
                "mandya-ragi",
                "old-mysuru",
                "mandya",
                "Ragi cultivation in Mandya",
                "Ragi is cultivated in the Mandya district.",
            ),
            _record(
                "udupi-ragi",
                "karavali",
                "udupi",
                "Ragi cultivation in Udupi",
                "Ragi is cultivated in the Udupi district.",
            ),
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "What crops are grown in Old Mysuru?"}
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert {source["document_id"] for source in result["sources"]} == {
        "mysuru-ragi",
        "mandya-ragi",
    }


def test_mysore_kingdom_query_uses_old_mysuru_region_not_mysuru_district(
    tmp_path, monkeypatch
):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "mandya-kingdom-history",
                "old-mysuru",
                "mandya",
                "Mysore Kingdom in Srirangapatna",
                "The Mysore Kingdom had its capital at Srirangapatna.",
                category="history",
            ),
            _record(
                "mysuru-district-history",
                "old-mysuru",
                "mysuru",
                "Mysuru district history",
                "This record concerns the history of Mysuru district.",
                category="history",
            ),
            _record(
                "udupi-kingdom-history",
                "karavali",
                "udupi",
                "Udupi history",
                "A coastal district history record.",
                category="history",
            ),
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "What is the history of the Mysore Kingdom?",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert {source["document_id"] for source in result["sources"]} == {
        "mandya-kingdom-history",
        "mysuru-district-history",
    }


def test_multi_region_query_retrieves_from_each_requested_region(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    records = [
        _record(
            f"mysuru-culture-{index}",
            "old-mysuru",
            "mysuru",
            f"Mysuru culture record {index}",
            "Mysuru cultural heritage includes local traditions.",
            category="culture",
        )
        for index in range(6)
    ]
    records.append(
        _record(
            "udupi-culture",
            "karavali",
            "udupi",
            "Udupi culture",
            "Udupi cultural heritage includes coastal traditions.",
            category="culture",
        )
    )
    _create_index(index_path, records)
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "Compare culture in Old Mysuru and Karavali.",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert {source["region"] for source in result["sources"]} == {
        "old-mysuru",
        "karavali",
    }


def test_badami_alias_scopes_history_to_bagalkot(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "badami-caves",
                "uttara-karnataka",
                "bagalkot",
                "Badami Caves",
                "Badami was an early Chalukya capital with rock-cut temple heritage.",
                category="history",
            ),
            _record(
                "mysuru-palace",
                "old-mysuru",
                "mysuru",
                "Mysuru palace history",
                "Mysuru has a palace with a royal history.",
                category="history",
            ),
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "Explain the historical significance of Badami.",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert [source["document_id"] for source in result["sources"]] == [
        "badami-caves"
    ]


def test_history_queries_include_heritage_records(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "nandi-hills",
                "old-mysuru",
                "chikkaballapura",
                "Nandi Hills and Nandidurga history",
                "Nandi Hills is a historic hill fort associated with Tipu Sultan.",
                category="heritage",
            )
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "What is the history of Nandi Hills?",
                }
            ],
            "region": "old-mysuru",
            "district": "chikkaballapura",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert [source["document_id"] for source in result["sources"]] == [
        "nandi-hills"
    ]


def test_agricultural_and_historical_query_wording_matches_records(
    tmp_path, monkeypatch
):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "mandya-farming",
                "old-mysuru",
                "mandya",
                "Mandya farming",
                "Mandya crops depend on irrigation and farming practices.",
            ),
            _record(
                "shivamogga-heritage",
                "malenadu-kodagu",
                "shivamogga",
                "Keladi heritage",
                "Keladi is a historical monument and a notable place in Shivamogga.",
                category="history",
            ),
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)
    client = TestClient(app)

    agriculture_response = client.post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "Explain the agricultural importance of Mandya.",
                }
            ]
        },
    )
    history_response = client.post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "What are historical places in Shivamogga?",
                }
            ]
        },
    )

    assert agriculture_response.status_code == 200
    assert agriculture_response.json()["sources"][0]["document_id"] == "mandya-farming"
    assert history_response.status_code == 200
    assert history_response.json()["sources"][0]["document_id"] == "shivamogga-heritage"


def test_follow_up_reuses_recent_user_context(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "mysuru-ragi-rainfall",
                "old-mysuru",
                "mysuru",
                "Ragi in Mysuru",
                "Mysuru's ragi cultivation depends on seasonal monsoon rainfall.",
            )
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "What crops are grown in Mysuru?"},
                {"role": "assistant", "content": "The record mentions ragi."},
                {"role": "user", "content": "What rainfall do they need?"},
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert "monsoon rainfall" in result["answer"]
    assert result["sources"][0]["document_id"] == "mysuru-ragi-rainfall"


def test_follow_up_stays_with_previous_cited_documents(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "udupi-yakshagana",
                "karavali",
                "udupi",
                "Yakshagana in Udupi",
                "Udupi's tourism guide describes Yakshagana dance-dramas.",
                category="culture",
            ),
            _record(
                "mysuru-yakshagana",
                "old-mysuru",
                "mysuru",
                "Yakshagana in Mysuru",
                "Mysuru's cultural guide describes Yakshagana performances.",
                category="culture",
            ),
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "What is Yakshagana?"},
                {
                    "role": "assistant",
                    "content": "Yakshagana is described in the Udupi guide.",
                    "source_ids": ["udupi-yakshagana"],
                },
                {"role": "user", "content": "Which district does the guide describe?"},
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert [source["document_id"] for source in result["sources"]] == [
        "udupi-yakshagana"
    ]


def test_missing_current_statistics_are_not_fabricated(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "kodagu-coffee",
                "malenadu-kodagu",
                "kodagu",
                "Coffee cultivation in Kodagu",
                "Coffee is a major plantation crop in Kodagu.",
            )
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setenv("GROQ_MODEL", "test-model")
    monkeypatch.setattr(knowledge_base, "urlopen", _unexpected_model_request)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "What is the current 2026 coffee output in Kodagu?",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["mode"] == "extractive"
    assert "do not verify the requested date or figure" in result["notice"]
    assert result["sources"][0]["document_id"] == "kodagu-coffee"


def test_no_matching_records_returns_no_fake_sources(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "bidar-history",
                "uttara-karnataka",
                "bidar",
                "Bidar heritage",
                "Bidar is known for Deccan-era architecture.",
                category="history",
            )
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "What is the quantum topology of coastal tides?",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["grounded"] is False
    assert result["mode"] == "not_found"
    assert result["sources"] == []


def test_knowledge_status_reports_embeddings_and_missing_ai_config(tmp_path, monkeypatch):
    index_path = tmp_path / "knowledge.sqlite3"
    _create_index(
        index_path,
        [
            _record(
                "kodagu-coffee",
                "malenadu-kodagu",
                "kodagu",
                "Coffee cultivation in Kodagu",
                "Coffee is a major plantation crop in Kodagu.",
            )
        ],
    )
    monkeypatch.setattr(knowledge_base, "INDEX_PATH", index_path)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_MODEL", raising=False)

    response = TestClient(app).get("/api/knowledge/status")

    assert response.status_code == 200
    result = response.json()
    assert result["document_count"] == 1
    assert result["embedding_count"] == 0
    assert result["vector_search_available"] is False
    assert result["ai"]["missing_environment"] == ["GROQ_API_KEY", "GROQ_MODEL"]
