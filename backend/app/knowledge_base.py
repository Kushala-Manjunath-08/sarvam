from __future__ import annotations

import json
import logging
import os
import re
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Literal, Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

INDEX_PATH = Path(__file__).resolve().parents[1] / "data" / "knowledge_index.sqlite3"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MAX_RESULTS = 5

REGION_NAMES = {
    "old-mysuru": "Old Mysuru",
    "uttara-karnataka": "Uttara Karnataka",
    "karavali": "Karavali",
    "malenadu-kodagu": "Malenadu & Kodagu",
}

REGION_DISTRICTS = {
    "old-mysuru": (
        "mysuru", "mandya", "chamarajanagar", "hassan", "tumakuru",
        "bengaluru-urban", "bengaluru-rural", "ramanagara", "kolar",
        "chikkaballapura",
    ),
    "uttara-karnataka": (
        "belagavi", "dharwad", "gadag", "bagalkot", "vijayapura", "haveri",
        "davangere", "chitradurga", "kalaburagi", "bidar", "yadgir",
        "raichur", "koppal", "ballari", "vijayanagara",
    ),
    "karavali": ("dakshina-kannada", "udupi", "uttara-kannada"),
    "malenadu-kodagu": ("kodagu", "chikkamagaluru", "shivamogga"),
}

REGION_ALIASES = {
    "old-mysore": "old-mysuru",
    "mysore-region": "old-mysuru",
    "mysore-kingdom": "old-mysuru",
    "kingdom-of-mysore": "old-mysuru",
    "north-karnataka": "uttara-karnataka",
    "coastal-karnataka": "karavali",
    "coastal-region": "karavali",
    "malenadu": "malenadu-kodagu",
    "malnad": "malenadu-kodagu",
    "kodagu": "malenadu-kodagu",
    "coorg": "malenadu-kodagu",
    "kodava": "malenadu-kodagu",
}

DISTRICT_NAMES = {
    "mysuru": "Mysuru",
    "mandya": "Mandya",
    "chamarajanagar": "Chamarajanagar",
    "hassan": "Hassan",
    "tumakuru": "Tumakuru",
    "bengaluru-urban": "Bengaluru Urban",
    "bengaluru-rural": "Bengaluru Rural",
    "ramanagara": "Ramanagara",
    "kolar": "Kolar",
    "chikkaballapura": "Chikkaballapura",
    "belagavi": "Belagavi",
    "dharwad": "Dharwad",
    "gadag": "Gadag",
    "bagalkot": "Bagalkot",
    "vijayapura": "Vijayapura",
    "haveri": "Haveri",
    "davangere": "Davangere",
    "chitradurga": "Chitradurga",
    "kalaburagi": "Kalaburagi",
    "bidar": "Bidar",
    "yadgir": "Yadgir",
    "raichur": "Raichur",
    "koppal": "Koppal",
    "ballari": "Ballari",
    "vijayanagara": "Vijayanagara",
    "dakshina-kannada": "Dakshina Kannada",
    "udupi": "Udupi",
    "uttara-kannada": "Uttara Kannada",
    "kodagu": "Kodagu",
    "chikkamagaluru": "Chikkamagaluru",
    "shivamogga": "Shivamogga",
}

DISTRICT_ALIASES = {
    "mysore": "mysuru",
    "coorg": "kodagu",
    "mangalore": "dakshina-kannada",
    "bangalore-urban": "bengaluru-urban",
    "bangalore-rural": "bengaluru-rural",
    "davanagere": "davangere",
    "chikkaballapur": "chikkaballapura",
    "yadgiri": "yadgir",
    "raichuru": "raichur",
    "badami": "bagalkot",
}

STOP_WORDS = {
    "a", "about", "and", "are", "as", "at", "be", "can", "did", "do", "does",
    "for", "from", "give", "has", "have", "how", "in", "into", "is", "it",
    "its", "me", "of", "on", "or", "please", "share", "tell", "that", "the",
    "their", "them", "there", "these", "they", "this", "those", "to", "was",
    "what", "when", "where", "which", "who", "why", "with", "would", "explain",
    "describe", "compare", "major", "important",
}

QUERY_EXPANSIONS = {
    "agriculture": ("crop", "farming", "cultivation"),
    "agricultural": ("agriculture", "crop", "farming"),
    "crops": ("crop", "farming", "cultivation"),
    "cultivated": ("crop", "farming", "cultivation"),
    "farming": ("agriculture", "crop", "cultivation"),
    "plantation": ("coffee", "pepper", "cardamom", "arecanut", "coconut"),
    "culture": ("tradition", "festival", "heritage"),
    "cultural": ("tradition", "festival", "heritage"),
    "history": ("historical", "dynasty", "heritage"),
    "historical": ("history", "dynasty", "heritage"),
    "places": ("place", "site", "sites", "temple", "monument", "heritage"),
    "traditional": ("tradition", "heritage", "festival"),
    "food": ("cuisine", "dish", "culinary"),
    "music": ("performance", "classical", "folk"),
    "festival": ("celebration", "jatre", "harvest"),
    "climate": ("rainfall", "monsoon", "weather"),
    "tourism": ("tourist", "place", "heritage"),
}

router = APIRouter()


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2500)
    source_ids: list[str] = Field(default_factory=list, max_length=MAX_RESULTS)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=12)
    region: Optional[str] = None
    district: Optional[str] = None


def _normalize(value: str) -> str:
    return "-".join(re.findall(r"[a-z0-9]+", value.casefold()))


def _contains_phrase(normalized_text: str, phrase: str) -> bool:
    normalized_phrase = " ".join(re.findall(r"[a-z0-9]+", phrase.casefold()))
    return bool(normalized_phrase) and f" {normalized_phrase} " in f" {normalized_text} "


def _resolve_region(value: str) -> Optional[str]:
    slug = _normalize(value)
    if slug in REGION_NAMES:
        return slug
    return REGION_ALIASES.get(slug)


def _resolve_district(value: str) -> Optional[str]:
    slug = _normalize(value)
    if slug in DISTRICT_NAMES:
        return slug
    return DISTRICT_ALIASES.get(slug)


def _infer_scope(text: str) -> tuple[list[str], list[str]]:
    normalized_text = " ".join(re.findall(r"[a-z0-9]+", text.casefold()))
    regions = set()
    districts = set()

    region_phrases = {
        "old-mysuru": (
            "old mysuru", "old mysore", "mysore region", "mysore kingdom",
            "kingdom of mysore", "mysuru kingdom", "southern royal",
        ),
        "uttara-karnataka": ("uttara karnataka", "north karnataka", "northern deccan"),
        "karavali": ("karavali", "coastal karnataka", "coastal region"),
        "malenadu-kodagu": (
            "malenadu", "malnad", "malenadu and kodagu", "malenadu kodagu",
            "kodagu", "coorg", "kodava",
        ),
    }
    for region, aliases in region_phrases.items():
        if any(_contains_phrase(normalized_text, alias) for alias in aliases):
            regions.add(region)

    district_search_text = normalized_text
    for alias in (
        "old mysuru", "old mysore", "mysore region",
        "mysore kingdom", "kingdom of mysore", "mysuru kingdom",
        "malenadu and kodagu", "malenadu kodagu",
    ):
        district_search_text = district_search_text.replace(alias, " ")

    district_phrases = {
        district: [name] for district, name in DISTRICT_NAMES.items()
    }
    for alias, district in DISTRICT_ALIASES.items():
        district_phrases[district].append(alias.replace("-", " "))
    for district, aliases in district_phrases.items():
        if any(_contains_phrase(district_search_text, alias) for alias in aliases):
            districts.add(district)

    return sorted(regions), sorted(districts)


def _query_tokens(text: str) -> list[str]:
    return [
        token
        for token in re.findall(r"[^\W_]+", text.casefold(), flags=re.UNICODE)
        if len(token) > 1 and token not in STOP_WORDS
    ]


def _scope_tokens(regions: list[str], districts: list[str]) -> set[str]:
    words = set()
    for region in regions:
        words.update(_query_tokens(REGION_NAMES[region]))
    for alias, region in REGION_ALIASES.items():
        if region in regions:
            words.update(_query_tokens(alias))
    for district in districts:
        words.update(_query_tokens(DISTRICT_NAMES[district]))
    for alias, district in DISTRICT_ALIASES.items():
        if district in districts:
            words.update(_query_tokens(alias))
    return words


def _build_match_query(text: str, regions: list[str], districts: list[str]) -> str:
    tokens = _query_tokens(text)
    scope_tokens = _scope_tokens(regions, districts)
    topic_tokens = [token for token in tokens if token not in scope_tokens]
    if not topic_tokens:
        topic_tokens = [
            token for token in scope_tokens if token not in STOP_WORDS
        ]

    expanded_tokens = list(topic_tokens)
    for token in topic_tokens:
        expanded_tokens.extend(QUERY_EXPANSIONS.get(token, ()))
    unique_tokens = list(dict.fromkeys(expanded_tokens))
    if not unique_tokens:
        return ""
    return " OR ".join(f'"{token.replace(chr(34), chr(34) * 2)}"' for token in unique_tokens)


def _validate_filters(
    request: ChatRequest,
    text: str,
) -> tuple[list[str], list[str]]:
    inferred_regions, inferred_districts = _infer_scope(text)
    regions = inferred_regions
    districts = inferred_districts

    if request.region:
        region = _resolve_region(request.region)
        if region is None:
            raise HTTPException(status_code=422, detail="Unknown knowledge region.")
        regions = [region]
    if request.district:
        district = _resolve_district(request.district)
        if district is None:
            raise HTTPException(status_code=422, detail="Unknown knowledge district.")
        districts = [district]

    return regions, districts


def _database_connection() -> sqlite3.Connection:
    if not INDEX_PATH.is_file():
        raise FileNotFoundError("The indexed SARVAM knowledge database is missing.")
    connection = sqlite3.connect(
        f"{INDEX_PATH.resolve().as_uri()}?mode=ro",
        uri=True,
        timeout=2,
    )
    connection.row_factory = sqlite3.Row
    return connection


def _database_failure(error: Exception) -> HTTPException:
    logger.exception("Could not read the SARVAM knowledge index.", exc_info=error)
    return HTTPException(
        status_code=503,
        detail="The SARVAM knowledge index is unavailable.",
    )


def _category_filter(text: str) -> list[str]:
    normalized = text.casefold()
    patterns = []
    if any(term in normalized for term in ("agriculture", "crop", "farming", "cultivat", "plantation")):
        patterns.append("%agriculture%")
    if any(term in normalized for term in ("history", "historical", "dynasty")):
        patterns.extend(("%history%", "%heritage%"))
    if any(term in normalized for term in ("culture", "cultural", "tradition", "festival", "yakshagana")):
        patterns.append("%culture%")
    if any(term in normalized for term in ("food", "cuisine", "dish", "recipe")):
        patterns.append("%food%")
    if any(term in normalized for term in ("geography", "climate", "rainfall", "landscape")):
        patterns.append("%geography%")
    if any(term in normalized for term in ("tourism", "tourist", "heritage", "monument", "place")):
        patterns.extend(("%heritage%", "%culture%"))
    return list(dict.fromkeys(patterns))


def _search_documents(
    match_query: str,
    regions: list[str],
    districts: list[str],
    categories: list[str],
    document_ids: Optional[list[str]] = None,
) -> list[dict[str, Any]]:
    if not match_query:
        return []

    if len(regions) > 1:
        regional_results = [
            _search_documents(
                match_query, [region], districts, categories, document_ids
            )
            for region in regions
        ]
        balanced_results = []
        seen_ids = set()
        for result_index in range(MAX_RESULTS):
            for documents in regional_results:
                if result_index >= len(documents):
                    continue
                document = documents[result_index]
                if document["id"] not in seen_ids:
                    balanced_results.append(document)
                    seen_ids.add(document["id"])
                    if len(balanced_results) == MAX_RESULTS:
                        return balanced_results
        return balanced_results

    clauses = [
        "knowledge_search MATCH ?",
        "d.verification_status = 'verified'",
    ]
    parameters: list[Any] = [match_query]

    if regions:
        clauses.append(f"d.region IN ({','.join('?' for _ in regions)})")
        parameters.extend(regions)
    if districts:
        clauses.append(f"d.district IN ({','.join('?' for _ in districts)})")
        parameters.extend(districts)
    if document_ids:
        clauses.append(f"d.id IN ({','.join('?' for _ in document_ids)})")
        parameters.extend(document_ids)
    if categories:
        clauses.append(
            "(" + " OR ".join("lower(d.category) LIKE ?" for _ in categories) + ")"
        )
        parameters.extend(categories)
    parameters.append(MAX_RESULTS)

    sql = f"""
        SELECT d.id, d.title, d.content, d.region, d.district, d.category,
               d.subcategory, d.source_url, d.source_title, d.source_org,
               d.publication_year, d.reporting_year, d.uncertainty,
               bm25(knowledge_search, 0.0, 4.0, 1.0, 2.0, 0.0, 0.0, 0.0) AS score
        FROM knowledge_search
        JOIN knowledge_documents d ON d.id = knowledge_search.doc_id
        WHERE {' AND '.join(clauses)}
        ORDER BY score
        LIMIT ?
    """

    connection = _database_connection()
    try:
        rows = connection.execute(sql, parameters).fetchall()
        if not rows and categories:
            return _search_documents(
                match_query, regions, districts, [], document_ids
            )
        return [dict(row) for row in rows]
    finally:
        connection.close()


def _internal_url(document: dict[str, Any]) -> str:
    region = document["region"]
    district = document["district"]
    if district:
        district_slug = {
            "chikkaballapura": "chikkaballapur",
            "davangere": "davanagere",
        }.get(district, district)
        return f"/districts/{district_slug}"
    return f"/regions/{region}"


def _source_payload(document: dict[str, Any]) -> dict[str, Any]:
    region = document["region"]
    district = document["district"]
    return {
        "document_id": document["id"],
        "title": document["title"],
        "region": region,
        "region_name": REGION_NAMES.get(region, region),
        "district": district,
        "district_name": DISTRICT_NAMES.get(district, district) if district else None,
        "source_title": document["source_title"],
        "source_org": document["source_org"],
        "source_url": document["source_url"],
        "internal_url": _internal_url(document),
        "publication_year": document["publication_year"],
        "reporting_year": document["reporting_year"],
    }


def _requested_details_supported(
    question: str,
    documents: list[dict[str, Any]],
) -> bool:
    evidence_text = " ".join(
        " ".join(
            str(document[field] or "")
            for field in (
                "title", "content", "publication_year", "reporting_year",
                "category", "subcategory",
            )
        )
        for document in documents
    ).casefold()
    year_text = " ".join(
        str(document[field] or "")
        for document in documents
        for field in ("publication_year", "reporting_year", "title", "content")
    )
    requested_years = re.findall(r"\b20\d{2}\b", question)
    if any(year not in year_text for year in requested_years):
        return False
    if re.search(r"\b(current|latest|recent|this year)\b", question.casefold()):
        source_years = [
            int(year)
            for year in re.findall(r"\b20\d{2}\b", year_text)
        ]
        if not source_years or max(source_years) < datetime.now().year - 1:
            return False

    metric_terms = {
        "output": ("output", "production", "yield", "tonne", "bale"),
        "production": ("production", "yield", "tonne", "bale"),
        "yield": ("yield", "production"),
        "area": ("area", "hectare", "acre"),
        "how much": ("production", "yield", "tonne", "bale", "area"),
        "how many": ("production", "yield", "tonne", "bale", "area"),
    }
    question_lower = question.casefold()
    for request_term, evidence_terms in metric_terms.items():
        if request_term in question_lower and not any(
            term in evidence_text for term in evidence_terms
        ):
            return False
    return True


def _evidence_answer(
    question: str,
    documents: list[dict[str, Any]],
    regions: list[str],
    districts: list[str],
) -> str:
    question_tokens = set(_query_tokens(question))
    topic_tokens = question_tokens - _scope_tokens(regions, districts)
    expanded = set(topic_tokens)
    for token in topic_tokens:
        expanded.update(QUERY_EXPANSIONS.get(token, ()))

    direct_match = not expanded or any(
        expanded.intersection(
            _query_tokens(
                f"{document['title']} {document['content']} {document['category']} "
                f"{document['subcategory']}"
            )
        )
        for document in documents
    )
    direct_match = direct_match and _requested_details_supported(question, documents)
    if direct_match:
        opening = "Relevant SARVAM records:"
    else:
        opening = (
            "The indexed SARVAM records do not directly answer that follow-up. "
            "These are the closest related records:"
        )

    entries = []
    for index, document in enumerate(documents, start=1):
        content = document["content"].strip()
        if len(content) > 850:
            content = content[:847].rsplit(" ", 1)[0] + "..."
        entry = f"[{index}] {document['title']}\n{content}"
        if document["uncertainty"]:
            entry += f"\nSource note: {document['uncertainty']}"
        entries.append(entry)
    return f"{opening}\n\n" + "\n\n".join(entries)


def _groq_answer(
    request: ChatRequest,
    documents: list[dict[str, Any]],
) -> Optional[str]:
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    model = os.environ.get("GROQ_MODEL", "").strip()
    if not api_key or not model:
        return None

    evidence = []
    for index, document in enumerate(documents, start=1):
        region = REGION_NAMES.get(document["region"], document["region"])
        district = DISTRICT_NAMES.get(document["district"], document["district"])
        location = f"{region} / {district}" if district else region
        evidence.append(
            f"[{index}] {document['title']} ({location})\n"
            f"{document['content']}\n"
            f"Source: {document['source_title']} — {document['source_url']}"
        )

    system_message = (
        "You are SARVAM's Karnataka knowledge assistant. Answer only from the "
        "retrieved records below and the supplied conversation context. Do not "
        "add outside facts, current statistics, or unsupported generalizations. "
        "If the records do not answer the question, say so plainly. Cite factual "
        "claims with the record markers such as [1]. Preserve uncertainty and "
        "distinguish targets from observed outcomes.\n\n"
        "Retrieved records:\n" + "\n\n".join(evidence)
    )
    history = [
        {"role": message.role, "content": message.content}
        for message in request.messages[:-1][-8:]
    ]
    messages = [
        {"role": "system", "content": system_message},
        *history,
        {"role": "user", "content": request.messages[-1].content.strip()},
    ]
    payload = json.dumps(
        {
            "model": model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 900,
        }
    ).encode("utf-8")
    provider_request = UrlRequest(
        GROQ_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(provider_request, timeout=20) as response:
            provider_payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        logger.error("Groq returned HTTP %s for a chat completion.", error.code)
        raise HTTPException(
            status_code=502,
            detail="The configured AI provider rejected the chat request. Check its backend model and key configuration.",
        ) from error
    except (URLError, TimeoutError) as error:
        logger.error("The configured AI provider could not be reached: %s", error)
        raise HTTPException(
            status_code=502,
            detail="The configured AI provider could not be reached before the timeout.",
        ) from error
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        logger.error("The configured AI provider returned an invalid response.")
        raise HTTPException(
            status_code=502,
            detail="The configured AI provider returned an invalid response.",
        ) from error

    try:
        answer = provider_payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        logger.error("The configured AI provider response did not contain a chat answer.")
        raise HTTPException(
            status_code=502,
            detail="The configured AI provider returned an incomplete response.",
        ) from error
    if not isinstance(answer, str) or not answer.strip():
        raise HTTPException(
            status_code=502,
            detail="The configured AI provider returned an empty answer.",
        )
    return answer.strip()


def _ai_configuration() -> dict[str, Any]:
    missing = [
        name
        for name, value in (
            ("GROQ_API_KEY", os.environ.get("GROQ_API_KEY", "").strip()),
            ("GROQ_MODEL", os.environ.get("GROQ_MODEL", "").strip()),
        )
        if not value
    ]
    return {
        "provider": "Groq" if not missing else None,
        "configured": not missing,
        "missing_environment": missing,
    }


@router.get("/api/knowledge/status")
def knowledge_status() -> dict[str, Any]:
    connection = None
    try:
        connection = _database_connection()
        document_count = connection.execute(
            "SELECT COUNT(*) FROM knowledge_documents WHERE verification_status = 'verified'"
        ).fetchone()[0]
        region_counts = {
            row["region"]: row["count"]
            for row in connection.execute(
                """
                SELECT region, COUNT(*) AS count
                FROM knowledge_documents
                WHERE verification_status = 'verified'
                GROUP BY region
                ORDER BY region
                """
            ).fetchall()
        }
        embedding_count = connection.execute(
            "SELECT COUNT(*) FROM knowledge_embeddings"
        ).fetchone()[0]
        districts_covered = connection.execute(
            """
            SELECT COUNT(DISTINCT district)
            FROM knowledge_documents
            WHERE verification_status = 'verified' AND district IS NOT NULL
            """
        ).fetchone()[0]
        return {
            "document_count": document_count,
            "region_counts": region_counts,
            "districts_covered": districts_covered,
            "districts_in_region_map": sum(map(len, REGION_DISTRICTS.values())),
            "embedding_count": embedding_count,
            "retrieval_mode": "keyword",
            "vector_search_available": False,
            "ai": _ai_configuration(),
        }
    except (OSError, sqlite3.Error) as error:
        raise _database_failure(error) from error
    finally:
        if connection is not None:
            connection.close()


@router.post("/api/chat")
def chat(request: ChatRequest) -> dict[str, Any]:
    if request.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="The last chat message must be from the user.")
    question = request.messages[-1].content.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Enter a question before sending.")

    previous_user_messages = [
        message.content.strip()
        for message in reversed(request.messages[:-1])
        if message.role == "user" and message.content.strip()
    ]
    previous_source_ids = next(
        (
            message.source_ids
            for message in reversed(request.messages[:-1])
            if message.role == "assistant" and message.source_ids
        ),
        [],
    )
    follow_up = (
        len(_query_tokens(question)) <= 4
        or re.search(r"\b(it|they|them|their|those|these|that|there)\b", question.casefold())
    )
    search_text = question
    if follow_up and previous_user_messages:
        search_text = f"{previous_user_messages[0]} {question}"

    regions, districts = _validate_filters(request, search_text)
    match_query = _build_match_query(search_text, regions, districts)
    categories = _category_filter(question)

    try:
        documents = _search_documents(
            match_query,
            regions,
            districts,
            categories,
            previous_source_ids if follow_up else None,
        )
    except (OSError, sqlite3.Error) as error:
        raise _database_failure(error) from error

    if not documents:
        return {
            "answer": (
                "I couldn't find a relevant record in SARVAM's current knowledge "
                "collection for that question. Try another topic, region, or district."
            ),
            "grounded": False,
            "mode": "not_found",
            "notice": None,
            "sources": [],
        }

    details_supported = _requested_details_supported(question, documents)
    answer = _groq_answer(request, documents) if details_supported else None
    if answer is None:
        answer = _evidence_answer(question, documents, regions, districts)
        if not details_supported:
            notice = (
                "The indexed records do not verify the requested date or figure. "
                "The excerpts below are related records, not evidence for that detail."
            )
        else:
            ai = _ai_configuration()
            missing = ", ".join(ai["missing_environment"])
            notice = (
                f"AI generation is not configured (missing {missing}); these are "
                "retrieved source excerpts, not an AI-generated synthesis."
            )
        mode = "extractive"
    else:
        notice = None
        mode = "groq"

    return {
        "answer": answer,
        "grounded": True,
        "mode": mode,
        "notice": notice,
        "sources": [_source_payload(document) for document in documents],
    }
