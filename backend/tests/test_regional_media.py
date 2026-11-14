import json

import pytest
from fastapi.testclient import TestClient

import app.main as main


@pytest.fixture
def regional_client(monkeypatch, tmp_path):
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    monkeypatch.setattr(main, "UPLOAD_DIR", upload_dir)
    monkeypatch.setattr(main, "DATABASE_FILE", tmp_path / "community.db")
    main.initialize_database()
    return TestClient(main.app), upload_dir


def test_region_gallery_upload_is_returned_and_persisted(regional_client):
    client, upload_dir = regional_client
    response = client.post(
        "/api/regions/old-mysuru/contributions",
        data={
            "district": "Mysuru",
            "location": "Mysuru Palace",
            "contributor": "Visitor",
            "experience": "A memorable evening visit.",
            "topics": json.dumps(["history", "architecture"]),
            "rights_confirmation": "true",
        },
        files={"file": ("palace.jpg", b"\xff\xd8\xffsample", "image/jpeg")},
    )

    assert response.status_code == 200
    contribution = response.json()["contribution"]
    assert contribution["region_id"] == "old-mysuru"
    assert contribution["district"] == "Mysuru"
    assert contribution["media_type"] == "image"
    assert (upload_dir / f"regional_{contribution['id']}.jpg").is_file()

    listed = client.get("/api/regions/old-mysuru/contributions")
    assert listed.status_code == 200
    assert listed.json()["contributions"] == [contribution]


def test_region_gallery_rejects_wrong_district_and_invalid_media(regional_client):
    client, _ = regional_client
    base_data = {
        "district": "Udupi",
        "location": "A coastal town",
        "contributor": "Visitor",
        "experience": "A visit.",
        "topics": "[]",
        "rights_confirmation": "true",
    }

    wrong_district = client.post(
        "/api/regions/old-mysuru/contributions",
        data=base_data,
    )
    assert wrong_district.status_code == 400

    invalid_media = client.post(
        "/api/regions/old-mysuru/contributions",
        data={**base_data, "district": "Mysuru"},
        files={"file": ("not-a-photo.jpg", b"not jpeg data", "image/jpeg")},
    )
    assert invalid_media.status_code == 400
