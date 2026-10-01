from datetime import datetime, date
from backend.app.core.config import settings

class PriorityScorer:
    """Calculates weighted priority score for topics based on urgency, weightage, difficulty, and weakness."""

    @classmethod
    def calculate_topic_priority(
        cls,
        exam_date_str: str,
        weightage: float,
        difficulty: int,
        confidence: int,
        ref_date: date = None
    ) -> float:
        if ref_date is None:
            ref_date = datetime.now().date()

        try:
            exam_date = datetime.strptime(exam_date_str, "%Y-%m-%d").date()
        except Exception:
            exam_date = ref_date + timedelta(days=14)

        days_remaining = (exam_date - ref_date).days
        days_remaining = max(1, days_remaining)

        # 1. Urgency score (scale 0-10)
        urgency_score = min(10.0, 30.0 / float(days_remaining))

        # 2. Subject weightage score (scale 0-10)
        weightage_score = max(1.0, min(10.0, float(weightage)))

        # 3. Difficulty score (scale 0-10)
        difficulty_score = max(1.0, min(5.0, float(difficulty))) * 2.0

        # 4. Weakness score (scale 0-10, lower confidence = higher priority)
        weakness_score = (6.0 - max(1.0, min(5.0, float(confidence)))) * 2.0

        # Weighted sum formula
        total_score = (
            (settings.URGENCY_WEIGHT * urgency_score) +
            (settings.WEIGHTAGE_WEIGHT * weightage_score) +
            (settings.DIFFICULTY_WEIGHT * difficulty_score) +
            (settings.WEAKNESS_WEIGHT * weakness_score)
        )

        return round(total_score, 2)

priority_scorer = PriorityScorer()
