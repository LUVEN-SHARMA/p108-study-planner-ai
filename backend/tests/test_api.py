from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.engines.llm_client import llm_client
from backend.app.engines.hybrid_engine import hybrid_engine
from backend.app.db.session import Base, get_db

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

def test_local_goal_parser_uses_each_subject_date_and_topic():
    parsed = llm_client._fallback_goal_parser(
        "History exam on November 12, weak in the French Revolution. "
        "Biology exam on Nov 20, difficult in genetics.",
        "2026-10-01",
    )

    assert [subject["subject_name"] for subject in parsed["subjects"]] == ["History", "Biology"]
    assert parsed["subjects"][0]["exam_date"] == "2026-11-12"
    assert parsed["subjects"][0]["topics"][0]["topic_name"] == "French Revolution"
    assert parsed["subjects"][1]["exam_date"] == "2026-11-20"
    assert parsed["subjects"][1]["topics"][0]["topic_name"] == "genetics"

def test_local_goal_parser_handles_engineering_subject_abbreviation_and_day_first_date():
    parsed = llm_client._fallback_goal_parser(
        "Eng. Phy exam on 20 Oct, weak in wave optics",
        "2026-10-01",
    )

    assert parsed["subjects"][0]["subject_name"] == "Engineering Physics"
    assert parsed["subjects"][0]["exam_date"] == "2026-10-20"
    assert parsed["subjects"][0]["topics"][0]["topic_name"] == "wave optics"
    assert parsed["clarification_needed"] is None

def test_subject_crud_endpoints():
    # Create subject
    payload = {
        "name": "Test Subject",
        "exam_date": "2026-11-01",
        "weightage": 7.0,
        "topics": [
            {"name": "Test Topic", "difficulty": 3, "confidence": 3, "est_hours": 2.0},
            {"name": "Second Topic", "difficulty": 4, "confidence": 2, "est_hours": 3.0},
        ]
    }
    create_resp = client.post("/subjects", json=payload)
    assert create_resp.status_code == 201
    subj_data = create_resp.json()
    subj_id = subj_data["id"]
    assert len(subj_data["topics"]) == 2

    # Get subjects
    get_resp = client.get("/subjects")
    assert get_resp.status_code == 200
    assert len(get_resp.json()) > 0

    # Delete subject
    del_resp = client.delete(f"/subjects/{subj_id}")
    assert del_resp.status_code == 204

def test_sample_dataset_endpoint_is_idempotent():
    first_response = client.post("/subjects/sample")
    second_response = client.post("/subjects/sample")

    assert first_response.status_code == 201
    assert second_response.status_code == 201
    assert second_response.json() == []

    subjects_response = client.get("/subjects")
    subjects = {subject["name"]: subject for subject in subjects_response.json()}
    for name in ("Physics", "Mathematics", "Biology", "Chemistry"):
        assert name in subjects
        assert len(subjects[name]["topics"]) == 2

    for subject in first_response.json():
        assert client.delete(f"/subjects/{subject['id']}").status_code == 204

def test_plan_generation_applies_prompt_without_touching_app_database(monkeypatch):
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=test_engine)
    test_session = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    def override_get_db():
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(
        hybrid_engine,
        "generate_explanations",
        lambda sessions, subjects: {"rationale": "Prompt-aware plan", "tips": []},
    )

    try:
        with TestClient(app) as test_client:
            for subject_name, topic_name, exam_date in (
                ("Physics", "Optics", "2026-11-01"),
                ("Biology", "Cells", "2026-11-05"),
                ("Engineering Mathematics", "Calculus", "2026-11-03"),
                ("Engineering Physics", "Mechanics", "2026-11-04"),
                ("DBMS", "Database normalization", "2026-11-05"),
                ("World History", "World War I", "2026-11-06"),
            ):
                response = test_client.post("/subjects", json={
                    "name": subject_name,
                    "exam_date": exam_date,
                    "weightage": 5.0,
                    "topics": [{"name": topic_name, "est_hours": 2.0}],
                })
                assert response.status_code == 201

            test_client.post("/availability", json=[
                {"weekday": day, "start": "16:00", "end": "21:00"}
                for day in range(7)
            ])
            response = test_client.post("/plan/generate", json={
                "start_date": "2026-10-01",
                "prompt": "Weekdays only, evenings, prioritize Biology",
            })

        assert response.status_code == 200
        data = response.json()
        assert data["prompt_applied"] == "Weekdays only, evenings, prioritize Biology"
        assert "Prioritized Biology." in data["prompt_notes"]
        assert data["sessions"]
        assert all(
            datetime.strptime(session["date"], "%Y-%m-%d").weekday() < 5
            and session["start"] >= "17:00"
            for session in data["sessions"]
        )
        assert data["sessions"][0]["subject_name"] == "Biology"

        gate_response = test_client.post("/plan/generate", json={
            "start_date": "2026-10-01",
            "prompt": "my exam is of gate on feb 2027 which i am preparing for give me the schedule for my preparation i have to give 4 hours per day for my exam to prepare",
        })
        assert gate_response.status_code == 200
        gate_data = gate_response.json()
        gate_subjects = {session["subject_name"] for session in gate_data["sessions"]}
        assert "Engineering Mathematics" in gate_subjects
        assert "Engineering Physics" in gate_subjects
        assert "DBMS" in gate_subjects
        assert "World History" not in gate_subjects
        assert "Biology" not in gate_subjects
        assert any("GATE exam detected" in note for note in gate_data["prompt_notes"])
        assert any("2027-02-28" in note for note in gate_data["prompt_notes"])
        assert any("4 study hours per available day" in note for note in gate_data["prompt_notes"])

        fallback_response = test_client.post("/plan/generate", json={
            "start_date": "2026-12-01",
            "prompt": "make a time table for my GATE exam",
        })
        assert fallback_response.status_code == 200
        fallback_data = fallback_response.json()
        assert fallback_data["sessions"]
        assert any("used a 14-day preparation window" in note for note in fallback_data["prompt_notes"])
        saved_subjects = {subject["name"]: subject for subject in test_client.get("/subjects").json()}
        assert saved_subjects["Engineering Physics"]["exam_date"] == "2026-11-04"
    finally:
        app.dependency_overrides.pop(get_db, None)
        test_engine.dispose()

def test_daily_tasks_can_be_created_completed_missed_and_deleted():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=test_engine)
    test_session = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    def override_get_db():
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            completed_response = test_client.post("/daily-tasks", json={
                "title": "Review lecture notes",
                "task_date": "2026-10-02",
                "start": "16:30",
                "note": "Focus on chapter three",
            })
            missed_response = test_client.post("/daily-tasks", json={
                "title": "Submit lab report",
                "task_date": "2026-10-02",
            })
            assert completed_response.status_code == 201
            assert missed_response.status_code == 201

            completed_id = completed_response.json()["id"]
            missed_id = missed_response.json()["id"]
            assert test_client.patch(
                f"/daily-tasks/{completed_id}", json={"status": "completed"}
            ).json()["status"] == "completed"
            assert test_client.patch(
                f"/daily-tasks/{missed_id}", json={"status": "missed"}
            ).json()["status"] == "missed"

            date_response = test_client.get("/daily-tasks", params={"task_date": "2026-10-02"})
            assert date_response.status_code == 200
            assert len(date_response.json()) == 2
            assert test_client.get(
                "/daily-tasks", params={"task_date": "2026-10-03"}
            ).json() == []
            assert test_client.delete(f"/daily-tasks/{completed_id}").status_code == 204
            assert test_client.delete(f"/daily-tasks/{missed_id}").status_code == 204
    finally:
        app.dependency_overrides.pop(get_db, None)
        test_engine.dispose()
