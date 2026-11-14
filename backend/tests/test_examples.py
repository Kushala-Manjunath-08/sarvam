import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

QUERIES = [
    "What is Yakshagana?",
    "Tell me about coastal agriculture and estuaries in Karavali.",
    "What historical destinations are found in Karavali?",
    "Explain the agricultural importance of Mandya and K.R. Sagar irrigation.",
    "Tell me about the history of Mysuru under the Wodeyars.",
    "What crops are grown in Mysuru and surrounding districts?",
    "What is Bidar's fort and its craft heritage?",
    "Tell me about Jowar and dryland agriculture in northern districts.",
    "What are the historical cave temples in Bagalkot?",
    "How is coffee cultivated in Kodagu?",
    "What are the historical places in Shivamogga?",
    "Tell me about Kodava ancestral homes (ainmane) and traditions.",
    "Compare agricultural practices in Old Mysuru and Malenadu.",
    "What are the cultural differences between Karavali and Uttara Karnataka?",
    "Which regions in Karnataka have significant plantation agriculture?",
]

@pytest.mark.parametrize("query", QUERIES)
def test_example_query(query):
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": query}]})
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is True, f"Query failed to ground: {query}"
    assert len(data["sources"]) > 0, f"Query returned no sources: {query}"
