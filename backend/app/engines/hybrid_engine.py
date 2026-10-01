from typing import List, Dict, Any
from backend.app.engines.llm_client import llm_client
from backend.app.engines.validators import ScheduleValidator

class HybridEngine:
    """
    Hybrid AI Engine Design:
    - Constraint-based scheduler guarantees feasibility, timing, and spaced revisions.
    - LLM provides language understanding (free-text parsing) and human-friendly explanations (rationale, tips, replan summary).
    """

    def __init__(self):
        self.llm = llm_client
        self.validator = ScheduleValidator()

    def parse_student_input(self, free_text: str) -> Dict[str, Any]:
        """LLM JSON extraction layer."""
        return self.llm.parse_goals(free_text)

    def generate_explanations(self, sessions: List[Dict[str, Any]], subjects: List[Dict[str, Any]]) -> Dict[str, Any]:
        """LLM explanation layer."""
        summary_lines = []
        for s in sessions[:10]:
            summary_lines.append(f"- {s.get('date')}: [{s.get('kind', 'study').upper()}] {s.get('topic_name')} ({s.get('start')}-{s.get('end')})")
        
        schedule_summary = "\n".join(summary_lines) or "No scheduled sessions."
        
        subjects_str = ", ".join([f"{subj.get('name')} (Exam: {subj.get('exam_date')})" for subj in subjects])
        
        rationale = self.llm.generate_rationale(schedule_summary)
        tips = self.llm.generate_tips(subjects_str, time_constraints="Exam deadlines approaching within 2-4 weeks.")

        return {
            "rationale": rationale,
            "tips": tips
        }

    def explain_replan(self, missed_topics: List[str], new_sessions: List[Dict[str, Any]]) -> str:
        missed_info = ", ".join(missed_topics) if missed_topics else "None"
        overview = f"Total {len(new_sessions)} updated sessions scheduled."
        return self.llm.generate_replan_explanation(missed_info, overview)

hybrid_engine = HybridEngine()
