import pytest
from backend.app.services.effort_estimator import effort_estimator

def test_effort_estimation_high_difficulty_low_confidence():
    # Difficulty=5, Confidence=1 -> High effort
    est = effort_estimator.estimate_topic_effort(difficulty=5, confidence=1)
    assert est >= 8.0

def test_effort_estimation_low_difficulty_high_confidence():
    # Difficulty=1, Confidence=5 -> Low effort
    est = effort_estimator.estimate_topic_effort(difficulty=1, confidence=5)
    assert est <= 1.0

def test_effort_estimation_override():
    est = effort_estimator.estimate_topic_effort(difficulty=3, confidence=3, user_override=4.5)
    assert est == 4.5
