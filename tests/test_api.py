from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_parse_goals_endpoint():
    response = client.post("/goals/parse", json={"free_text": "Physics exam on 20 Oct, weak in optics."})
    assert response.status_code == 200
    data = response.json()
    assert "subjects" in data
    assert len(data["subjects"]) > 0

def test_subject_crud_endpoints():
    # Create subject
    payload = {
        "name": "Test Subject",
        "exam_date": "2026-11-01",
        "weightage": 7.0,
        "topics": [{"name": "Test Topic", "difficulty": 3, "confidence": 3, "est_hours": 2.0}]
    }
    create_resp = client.post("/subjects", json=payload)
    assert create_resp.status_code == 201
    subj_data = create_resp.json()
    subj_id = subj_data["id"]

    # Get subjects
    get_resp = client.get("/subjects")
    assert get_resp.status_code == 200
    assert len(get_resp.json()) > 0

    # Delete subject
    del_resp = client.delete(f"/subjects/{subj_id}")
    assert del_resp.status_code == 204
