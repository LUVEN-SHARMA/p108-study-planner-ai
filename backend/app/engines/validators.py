from datetime import datetime
from typing import List, Dict, Any

class ScheduleValidator:
    """Validates timetable feasibility and flags potential overload/conflicts."""

    @staticmethod
    def validate_feasibility(
        total_required_hours: float,
        total_available_hours: float,
        topics: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        
        shortfall = max(0.0, total_required_hours - total_available_hours)
        is_feasible = shortfall == 0.0

        suggestions = []
        if not is_feasible:
            suggestions.append(f"Increase daily study hours by {round(shortfall / 7.0, 1)} hours/day over the week.")
            suggestions.append("Consider reducing estimated study hours for lower difficulty topics.")
            suggestions.append("Extend exam target deadlines if possible to spread effort evenly.")

        return {
            "is_feasible": is_feasible,
            "total_required_hours": round(total_required_hours, 1),
            "total_available_hours": round(total_available_hours, 1),
            "shortfall_hours": round(shortfall, 1),
            "suggestions": suggestions
        }

    @staticmethod
    def check_deadline_compliance(sessions: List[Dict[str, Any]], subjects: List[Dict[str, Any]]) -> List[str]:
        """Verify that all study sessions for a subject occur prior to its exam date."""
        warnings = []
        subject_dates = {s["id"]: datetime.strptime(s["exam_date"], "%Y-%m-%d").date() for s in subjects if "exam_date" in s}
        
        for sess in sessions:
            subj_id = sess.get("subject_id")
            sess_date = datetime.strptime(sess["date"], "%Y-%m-%d").date() if isinstance(sess["date"], str) else sess["date"]
            if subj_id in subject_dates:
                if sess_date >= subject_dates[subj_id]:
                    warnings.append(f"Session for topic '{sess.get('topic_name')}' on {sess_date} is on or after exam date {subject_dates[subj_id]}.")

        return warnings
