from datetime import datetime, timedelta
from backend.app.services.priority_scorer import priority_scorer

def test_priority_scorer_urgency():
    today = datetime.now().date()
    near_date = (today + timedelta(days=2)).strftime("%Y-%m-%d")
    far_date = (today + timedelta(days=30)).strftime("%Y-%m-%d")

    score_near = priority_scorer.calculate_topic_priority(near_date, weightage=5.0, difficulty=3, confidence=3, ref_date=today)
    score_far = priority_scorer.calculate_topic_priority(far_date, weightage=5.0, difficulty=3, confidence=3, ref_date=today)

    assert score_near > score_far

def test_priority_scorer_weakness():
    today = datetime.now().date()
    date_str = (today + timedelta(days=10)).strftime("%Y-%m-%d")

    # Lower confidence (confidence=1) should yield higher priority score than confidence=5
    score_weak = priority_scorer.calculate_topic_priority(date_str, weightage=5.0, difficulty=3, confidence=1, ref_date=today)
    score_strong = priority_scorer.calculate_topic_priority(date_str, weightage=5.0, difficulty=3, confidence=5, ref_date=today)

    assert score_weak > score_strong
