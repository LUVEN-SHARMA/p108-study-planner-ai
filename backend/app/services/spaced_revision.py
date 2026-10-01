from datetime import datetime, timedelta
from typing import List, Dict, Any

class SpacedRevisionService:
    """Generates spaced repetition revision intervals (1, 3, 7, 14 days after study session)."""

    REVISION_INTERVALS = [1, 3, 7, 14]
    DEFAULT_REVISION_DURATION_HOURS = 0.5

    @classmethod
    def get_revision_dates(cls, study_date_str: str) -> List[str]:
        study_date = datetime.strptime(study_date_str, "%Y-%m-%d").date()
        revision_dates = []
        for interval in cls.REVISION_INTERVALS:
            rev_date = study_date + timedelta(days=interval)
            revision_dates.append(rev_date.strftime("%Y-%m-%d"))
        return revision_dates

spaced_revision_service = SpacedRevisionService()
