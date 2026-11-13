import json
import sqlite3
from pathlib import Path
from typing import Optional

import pytest
from fastapi.testclient import TestClient

import app.knowledge_base as knowledge_base
from app.knowledge_base import KnowledgeBaseError, KnowledgeIndex, REGION_DISTRICTS
from app.main import app


def _record(
    record_id: str,
    region: str,
    district: Optional[str],
    title: str,
    content: str,
    status: str = "verified",
) -> dict[str, object]:
    return {
        "id": record_id,
        "title": title,
        "content": content,
        "region": region,
        "district": district,
        "category": "culture",
        "source_url": "https://example.gov.in/heritage",
        "source_title": "District heritage profile",
        "source_org": "District Administration",
        "verification_status": status,
        "keywords": ["heritage", "tradition"],
    }


def _write_corpus(path, records: list[dict[str, object]]) -> None:
    path.write_text(
        "\n".join(json.dumps(record) for record in records),
        encoding="utf-8",
    )


def test_region_mapping_covers_all_31_districts() -> None:
    assert [len(districts) for districts in REGION_DISTRICTS.values()] == [10, 15, 3, 3]
    assert sum(len(districts) for districts in REGION_DISTRICTS.values()) == 31
    regions_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "karnataka-knowledge-base"
        / "regions.json"
    )
    regions = json.loads(regions_path.read_text(encoding="utf-8"))["regions"]
    assert {
        region["slug"]: {
            district.lower().replace(" ", "-")
            for district in region["districts"]
        }
        for region in regions
    } == {region: set(districts) for region, districts in REGION_DISTRICTS.items()}


def test_reindex_search_and_incremental_updates(tmp_path) -> None:
    corpus = tmp_path / "documents.jsonl"
    old_mysuru_record = _record(
        "mysuru-dasara",
        "old-mysuru",
        "mysuru",
        "Mysuru Dasara",
        "Mysuru Dasara is an annual festival with public cultural programmes.",
    )
    karavali_record = _record(
        "udupi-yakshagana",
        "karavali",
        "udupi",
        "Yakshagana in Udupi",
        "Yakshagana is a coastal theatre tradition with music and elaborate costume.",
    )
    _write_corpus(corpus, [old_mysuru_record, karavali_record])
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")

    initial = index.reindex()
    assert initial["added"] == 2
    results = index.search("Mysuru Dasara", region="old-mysuru", district="mysuru")
    assert [result["id"] for result in results] == ["mysuru-dasara"]

    updated_record = {
        **old_mysuru_record,
        "content": "Mysuru Dasara includes public cultural programmes and a procession.",
    }
    _write_corpus(corpus, [updated_record])
    updated = index.reindex()

    assert updated["updated"] == 1
    assert updated["removed"] == 1
    assert index.search("Mysuru procession", region="old-mysuru")[0]["id"] == "mysuru-dasara"
    index.close()


def test_source_registry_includes_review_status_and_additional_sources(tmp_path) -> None:
    corpus = tmp_path / "documents.jsonl"
    verified_record = _record(
        "verified-record",
        "uttara-karnataka",
        "bidar",
        "Bidar heritage",
        "Historical heritage in Bidar.",
    )
    verified_record["additional_sources"] = [
        {
            "title": "Archaeology profile",
            "organization": "State Department",
            "url": "https://example.gov.in/archaeology",
        }
    ]
    review_record = _record(
        "review-record",
        "uttara-karnataka",
        "bidar",
        "Bidar claim to review",
        "This claim needs review.",
        status="needs_review",
    )
    _write_corpus(corpus, [verified_record, review_record])
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")

    index.reindex()

    registry = json.loads(
        (tmp_path / "source-registry.json").read_text(encoding="utf-8")
    )
    sources = {source["url"]: source for source in registry["sources"]}
    assert sources["https://example.gov.in/heritage"]["verification_status"] == "needs_review"
    assert sources["https://example.gov.in/heritage"]["record_ids"] == [
        "review-record",
        "verified-record",
    ]
    assert sources["https://example.gov.in/archaeology"]["source_types"] == ["additional"]
    assert sources["https://example.gov.in/archaeology"]["record_ids"] == ["verified-record"]
    assert index.search("Bidar heritage")[0]["id"] == "verified-record"
    index.close()


def test_stale_index_schema_is_rebuilt_for_regional_records(tmp_path) -> None:
    corpus = tmp_path / "documents.jsonl"
    index_path = tmp_path / "knowledge.sqlite3"
    _write_corpus(
        corpus,
        [
            _record(
                "regional-overview",
                "karavali",
                None,
                "Karavali overview",
                "This region-level record summarizes coastal traditions.",
            )
        ],
    )
    with sqlite3.connect(index_path) as connection:
        connection.execute(
            "CREATE TABLE knowledge_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
        )
        connection.execute(
            "CREATE TABLE knowledge_documents (id TEXT PRIMARY KEY, district TEXT NOT NULL)"
        )

    index = KnowledgeIndex(corpus, index_path, embedding_model_name="")

    result = index.reindex()

    assert result["added"] == 1
    assert index.search("coastal traditions")[0]["id"] == "regional-overview"
    assert index._metadata("schema_version") == knowledge_base.INDEX_SCHEMA_VERSION
    index.close()


def test_unverified_records_are_excluded_from_retrieval(tmp_path) -> None:
    corpus = tmp_path / "documents.jsonl"
    _write_corpus(
        corpus,
        [
            _record(
                "unverified-place",
                "uttara-karnataka",
                "bidar",
                "Unverified place",
                "This claim needs review.",
                status="needs_review",
            )
        ],
    )
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")

    with pytest.raises(KnowledgeBaseError, match="no verified records"):
        index.reindex()
    index.close()


def test_rejects_district_assigned_to_wrong_region(tmp_path) -> None:
    corpus = tmp_path / "documents.jsonl"
    _write_corpus(
        corpus,
        [
            _record(
                "misassigned-district",
                "old-mysuru",
                "udupi",
                "Misassigned district",
                "This record has an invalid region mapping.",
            )
        ],
    )
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")

    with pytest.raises(KnowledgeBaseError, match="wrong region"):
        index.reindex()
    index.close()


def test_chat_endpoint_returns_grounded_answer_and_citations(tmp_path, monkeypatch) -> None:
    corpus = tmp_path / "documents.jsonl"
    _write_corpus(
        corpus,
        [
            _record(
                "mysuru-dasara",
                "old-mysuru",
                "mysuru",
                "Mysuru Dasara",
                "Mysuru Dasara is an annual festival with public cultural programmes.",
            )
        ],
    )
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")
    monkeypatch.setattr(knowledge_base, "INDEX", index)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "Tell me about Mysuru Dasara"}]},
    )

    assert response.status_code == 200
    result = response.json()
    assert "Mysuru Dasara" in result["answer"]
    assert result["grounded"] is True
    assert result["sources"][0]["url"] == "https://example.gov.in/heritage"
    index.close()
