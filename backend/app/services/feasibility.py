from typing import List, Dict, Any
from backend.app.ai.validators import ScheduleValidator

class FeasibilityChecker:
    """Calculates total study & revision workload vs available study slots."""

    @classmethod
    def evaluate(
        cls,
        topics: List[Dict[str, Any]],
        availability_slots: List[Dict[str, Any]],
        num_days: int = 14,
        assume_default_when_empty: bool = True,
    ) -> Dict[str, Any]:
        # 1. Total study hours required
        study_hours = sum(t.get("est_hours", 2.0) for t in topics)
        # Spaced revision adds 4 revisions * 0.5h per topic
        revision_hours = len(topics) * (4 * 0.5)
        total_required = study_hours + revision_hours

        # 2. Total available hours over window
        daily_hours_map = {i: 0.0 for i in range(7)}
        for slot in availability_slots:
            try:
                sh, sm = map(int, slot["start"].split(":"))
                eh, em = map(int, slot["end"].split(":"))
                dur = (eh + em/60.0) - (sh + sm/60.0)
                if dur > 0:
                    daily_hours_map[slot["weekday"]] += dur
            except Exception:
                pass

        # Sum available hours across num_days
        total_available = 0.0
        for d in range(num_days):
            weekday = d % 7
            total_available += daily_hours_map[weekday]

        if total_available == 0.0 and assume_default_when_empty:
            # Default fallback assumption of 2h/day if no availability configured
            total_available = num_days * 2.0

        return ScheduleValidator.validate_feasibility(
            total_required_hours=total_required,
            total_available_hours=total_available,
            topics=topics
        )

feasibility_checker = FeasibilityChecker()
