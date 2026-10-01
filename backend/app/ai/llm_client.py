import os
import json
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List
from backend.app.config import settings

class GeminiLLMClient:
    """Provider adapter for Google Gemini API with robust fallbacks."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.model_name = settings.LLM_MODEL
        self.client = None
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            return
        try:
            # Try new google-genai SDK first
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            self.sdk_type = "genai"
        except Exception:
            try:
                # Fallback to google-generativeai SDK
                import google.generativeai as genai_legacy
                genai_legacy.configure(api_key=self.api_key)
                self.client = genai_legacy.GenerativeModel("gemini-1.5-flash")
                self.sdk_type = "legacy"
            except Exception:
                self.client = None
                self.sdk_type = None

    def _load_prompt(self, filename: str) -> str:
        prompt_dir = os.path.join(os.path.dirname(__file__), "prompts")
        file_path = os.path.join(prompt_dir, filename)
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        return ""

    def generate_text(self, prompt: str) -> str:
        """Helper to invoke Gemini LLM or return empty if unavailable."""
        if not self.client:
            return ""
        try:
            if self.sdk_type == "genai":
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                )
                return response.text or ""
            elif self.sdk_type == "legacy":
                response = self.client.generate_content(prompt)
                return response.text or ""
        except Exception as e:
            print(f"[GeminiLLMClient Error] {e}")
            return ""
        return ""

    def parse_goals(self, free_text: str) -> Dict[str, Any]:
        """Extract structured subjects and topics from free text using Gemini LLM or fallback parser."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        template = self._load_prompt("goal_parser.txt")
        prompt = template.replace("{today_date}", today_str).replace("{free_text}", free_text)

        raw_llm_output = self.generate_text(prompt)
        if raw_llm_output:
            parsed = self._extract_json(raw_llm_output)
            if parsed and "subjects" in parsed and len(parsed["subjects"]) > 0:
                return parsed

        # --- Rule-Based Fallback Parser if LLM is unavailable or unparseable ---
        return self._fallback_goal_parser(free_text, today_str)

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from markdown code blocks or raw text."""
        try:
            # Match ```json ... ```
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
            if match:
                return json.loads(match.group(1))
            
            # Match raw {...}
            match_raw = re.search(r"(\{.*\})", text, re.DOTALL)
            if match_raw:
                return json.loads(match_raw.group(1))
        except Exception as e:
            print(f"[JSON Extraction Error] {e}")
        return {}

    def _fallback_goal_parser(self, text: str, today_str: str) -> Dict[str, Any]:
        """Intelligent regex/heuristic fallback parser for student goal text."""
        today = datetime.now()
        subjects_found = []
        
        # Simple extraction heuristics
        lines = text.replace(",", "\n").replace(".", "\n").split("\n")
        current_subject = "General Study"
        exam_date = (today + timedelta(days=14)).strftime("%Y-%m-%d")
        topics = []
        
        # Common subjects detection
        known_subjects = ["Physics", "Chemistry", "Mathematics", "Math", "Biology", "Computer Science", "History", "English", "Economics"]
        
        # Check for exam dates in text e.g. "20 Oct", "20 October", "2026-10-20"
        date_match = re.search(r"(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*", text, re.IGNORECASE)
        if date_match:
            day = int(date_match.group(1))
            month_str = date_match.group(2)[:3].title()
            month_num = datetime.strptime(month_str, "%b").month
            year = today.year if month_num >= today.month else today.year + 1
            exam_date = f"{year}-{month_num:02d}-{day:02d}"

        # Detect subjects and topics
        text_lower = text.lower()
        for subj in known_subjects:
            if subj.lower() in text_lower:
                current_subject = subj
                break

        # Extract topics / weak areas
        weak_topics = []
        if "weak in" in text_lower or "difficult" in text_lower or "need practice" in text_lower:
            parts = re.split(r"weak in|difficult in|need help with", text_lower)
            if len(parts) > 1:
                topic_words = parts[1].strip().split()[:3]
                if topic_words:
                    weak_topics.append(" ".join(topic_words).title())

        if not weak_topics:
            weak_topics = [f"{current_subject} Chapter 1", f"{current_subject} Core Concepts"]

        for t_name in weak_topics:
            topics.append({
                "topic_name": t_name,
                "difficulty": 4 if "weak" in text_lower else 3,
                "confidence": 2 if "weak" in text_lower else 3,
                "estimated_hours": 4.0
            })

        subjects_found.append({
            "subject_name": current_subject,
            "exam_date": exam_date,
            "weightage": 7.5,
            "topics": topics
        })

        return {
            "subjects": subjects_found,
            "clarification_needed": None
        }

    def generate_rationale(self, schedule_summary: str) -> str:
        """Generate human-friendly rationale for the timetable."""
        template = self._load_prompt("rationale.txt")
        prompt = template.replace("{schedule_summary}", schedule_summary)
        llm_out = self.generate_text(prompt)
        if llm_out:
            return llm_out.strip()
        
        # Fallback rationale
        return (
            "• Study sessions are prioritized based on upcoming exam dates and topic difficulty ratings.\n"
            "• Harder topics with lower confidence are scheduled early to maximize retention.\n"
            "• Spaced repetition intervals (1-3-7-14 days) are built into the schedule for systematic revision.\n"
            "• Available study windows were strictly respected to prevent student burnout."
        )

    def generate_tips(self, subjects_info: str, time_constraints: str) -> List[str]:
        """Generate study techniques & tips."""
        template = self._load_prompt("tips.txt")
        prompt = template.replace("{subjects_info}", subjects_info).replace("{time_constraints}", time_constraints)
        llm_out = self.generate_text(prompt)
        if llm_out:
            tips = [line.strip("- *•").strip() for line in llm_out.split("\n") if line.strip("- *•").strip()]
            if tips:
                return tips[:4]

        # Fallback tips
        return [
            "Use Active Recall: Test yourself with flashcards or practice questions instead of passive re-reading.",
            "Feynman Technique: Try explaining complex topics in simple terms as if teaching a beginner.",
            "Pomodoro Method: Work in 25-minute focused blocks followed by a 5-minute break.",
            "Spaced Testing: Review key concepts 1, 3, and 7 days after initial learning for peak memory retention."
        ]

    def generate_replan_explanation(self, missed_info: str, updated_overview: str) -> str:
        """Generate explanation of re-planned schedule after missed sessions."""
        template = self._load_prompt("replan_explanation.txt")
        prompt = template.replace("{missed_info}", missed_info).replace("{updated_overview}", updated_overview)
        llm_out = self.generate_text(prompt)
        if llm_out:
            return llm_out.strip()

        # Fallback explanation
        return (
            "The schedule has been automatically updated. Missed sessions have been re-allocated "
            "into your upcoming available windows while preserving high-priority exam preparation. "
            "Revision sessions were adjusted to ensure you remain fully on track without overload."
        )

llm_client = GeminiLLMClient()
