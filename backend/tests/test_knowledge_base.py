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


def test_extractive_answer_is_brief_and_cited() -> None:
    documents = [
        {
            "content": (
                "Mandya's Agriculture page says irrigation from the K.R. Sagar "
                "reservoir, beginning in the 1930s, substantially changed the "
                "district's cropping pattern and crop yields. This second sentence "
                "adds details that are not needed for a short response."
            )
        },
        {
            "content": (
                "Mysuru district describes Dasara as a state festival with a "
                "Chamundeshwari procession and cultural programmes."
            )
        },
    ]

    answer = knowledge_base._format_extractive_answer(
        documents,
        "What changed Mandya's cropping pattern?",
    )

    assert "K.R. Sagar" in answer
    assert "[1]" in answer
    assert len(answer.split()) <= 63
    assert "not needed" not in answer


def test_retrieval_query_ignores_assistant_claims() -> None:
    messages = [
        knowledge_base.ChatMessage(role="user", content="Tell me about Mysuru Dasara."),
        knowledge_base.ChatMessage(
            role="assistant",
            content="An unsupported answer about coastal fishing.",
        ),
        knowledge_base.ChatMessage(role="user", content="When is it celebrated?"),
    ]

    query = knowledge_base._retrieval_query(messages)

    assert "Mysuru Dasara" in query
    assert "When is it celebrated?" in query
    assert "unsupported answer" not in query


def test_current_question_region_overrides_browsed_region_context(
    tmp_path,
    monkeypatch,
) -> None:
    corpus = tmp_path / "documents.jsonl"
    _write_corpus(
        corpus,
        [
            _record(
                "bidar-heritage",
                "uttara-karnataka",
                "bidar",
                "Bidar heritage",
                "Bidar is known for its historical heritage and Bidriware craft.",
            ),
            _record(
                "kodagu-coffee",
                "malenadu-kodagu",
                "kodagu",
                "Kodagu coffee",
                "Kodagu is known for coffee cultivation in its highlands.",
            ),
        ],
    )
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")
    monkeypatch.setattr(knowledge_base, "INDEX", index)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "Tell me about Bidar's heritage"}
            ],
            "context_region": "malenadu-kodagu",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert "Bidar" in result["answer"]
    assert result["sources"][0]["region"] == "Uttara Karnataka"
    index.close()


def test_district_question_does_not_use_unscoped_regional_food_record(
    tmp_path,
    monkeypatch,
) -> None:
    corpus = tmp_path / "documents.jsonl"
    regional_food = _record(
        "kodava-foodways",
        "malenadu-kodagu",
        None,
        "Kodava pork cuisine",
        "A regional guide lists Kodava pork delicacies.",
    )
    regional_food["keywords"] = ["Kodava", "food", "pork", "cuisine"]
    district_food = _record(
        "shivamogga-appe-midi",
        "malenadu-kodagu",
        "shivamogga",
        "Appe Midi tender mango pickle in Sagar",
        "Shivamogga's tourism guide highlights Appe Midi, a tender mango pickle prepared in Sagar.",
    )
    district_food["keywords"] = ["Appe Midi", "food", "pickle", "Sagar"]
    _write_corpus(corpus, [regional_food, district_food])
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")
    monkeypatch.setattr(knowledge_base, "INDEX", index)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    client = TestClient(app)

    district_response = client.post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "Tell me about Shivamogga's food"}
            ],
            "context_region": "malenadu-kodagu",
        },
    )
    regional_response = client.post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "Tell me about Kodava pork"}
            ],
            "context_region": "malenadu-kodagu",
        },
    )

    assert district_response.status_code == 200
    district_result = district_response.json()
    assert district_result["grounded"] is True
    assert "Appe Midi" in district_result["answer"]
    assert {source["district"] for source in district_result["sources"]} == {
        "Shivamogga"
    }

    assert regional_response.status_code == 200
    regional_result = regional_response.json()
    assert regional_result["grounded"] is True
    assert regional_result["sources"][0]["district"] == "Multiple districts"
    index.close()


def test_chat_does_not_claim_grounding_without_evidence(tmp_path, monkeypatch) -> None:
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
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "Explain quantum mechanics and black holes.",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["grounded"] is False
    assert result["sources"] == []
    index.close()


def test_chat_retrieves_huthri_when_asked_with_an_event_verb(tmp_path, monkeypatch) -> None:
    corpus = tmp_path / "documents.jsonl"
    _write_corpus(
        corpus,
        [
            _record(
                "kodava-huthri",
                "malenadu-kodagu",
                "kodagu",
                "Huthri, a Kodava harvest festival",
                "Huthri is associated with the new paddy crop, generally when it is ready for harvest in November and December.",
            )
        ],
    )
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")
    monkeypatch.setattr(knowledge_base, "INDEX", index)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "When is Huthri celebrated?"}
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["grounded"] is True
    assert result["sources"][0]["district"] == "Kodagu"
    index.close()


def test_regional_crop_question_matches_source_topic_terms(tmp_path, monkeypatch) -> None:
    corpus = tmp_path / "documents.jsonl"
    crop_record = _record(
        "shivamogga-crops",
        "malenadu-kodagu",
        "shivamogga",
        "Shivamogga horticulture crops",
        "The department lists arecanut and ginger cultivated in Malnad regions.",
    )
    crop_record["keywords"] = ["crops", "cultivation", "arecanut", "ginger"]
    _write_corpus(corpus, [crop_record])
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")
    monkeypatch.setattr(knowledge_base, "INDEX", index)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    response = TestClient(app).post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "Which crops are grown in this region?"}
            ],
            "context_region": "malenadu-kodagu",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["grounded"] is True
    assert result["sources"][0]["id"] == "shivamogga-crops"
    index.close()


def test_chat_rejects_a_single_incidental_keyword_match(tmp_path, monkeypatch) -> None:
    corpus = tmp_path / "documents.jsonl"
    _write_corpus(
        corpus,
        [
            _record(
                "coffee-black-pepper",
                "malenadu-kodagu",
                "kodagu",
                "Coffee and black pepper",
                "Kodagu farms grow coffee and black pepper in mixed gardens.",
            ),
            _record(
                "krishna-temple-window",
                "karavali",
                "udupi",
                "Krishna temple window",
                "A decorated temple window has nine holes.",
            ),
        ],
    )
    index = KnowledgeIndex(corpus, ":memory:", embedding_model_name="")
    monkeypatch.setattr(knowledge_base, "INDEX", index)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    client = TestClient(app)
    for question in (
        "Explain quantum mechanics and black holes.",
        "Explain black holes.",
    ):
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": question}]},
        )

        assert response.status_code == 200
        result = response.json()
        assert result["grounded"] is False
        assert result["sources"] == []
    index.close()
