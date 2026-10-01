import os
import json
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List
from backend.app.core.config import settings

class GeminiLLMClient:
    """Provider adapter for Google Gemini API with robust fallbacks."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.model_name = settings.LLM_MODEL
        if self.model_name == "gemini-2.5-flash":
            self.model_name = "gemini-3.8-flash"
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
        prompt_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "prompts", "tasks")
        )
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
                parsed["parser_mode"] = "gemini"
                return parsed

        parsed = self._fallback_goal_parser(free_text, today_str)
        parsed["parser_mode"] = "local"
        return parsed

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
        """Extract known subjects, their dates, and named topics without inventing data."""
        today = datetime.strptime(today_str, "%Y-%m-%d").date()
        aliases = {
            "computer science": "Computer Science",
            "mathematics": "Mathematics",
            "maths": "Mathematics",
            "math": "Mathematics",
            "physics": "Physics",
            "phy": "Physics",
            "chemistry": "Chemistry",
            "chem": "Chemistry",
            "biology": "Biology",
            "bio": "Biology",
            "history": "History",
            "english": "English",
            "economics": "Economics",
        }
        alias_pattern = re.compile(
            r"(?<!\w)(" + "|".join(re.escape(alias) for alias in sorted(aliases, key=len, reverse=True)) + r")(?!\w)",
            re.IGNORECASE,
        )
        subject_mentions = []
        for match in alias_pattern.finditer(text):
            before = text[max(0, match.start() - 24):match.start()]
            after = text[match.end():match.end() + 24]
            follows_exam = re.match(
                r"\s+(?:(?:final|midterm|upcoming|board)\s+)?(?:exam|test|quiz)\b",
                after,
                re.IGNORECASE,
            )
            follows_exam_preposition = re.search(
                r"\b(?:exam|test|quiz)\s+(?:in|for)\s+$", before, re.IGNORECASE
            )
            if not follows_exam and not follows_exam_preposition:
                continue

            subject_name = aliases[match.group(1).lower()]
            start = match.start()
            prefix = text[max(0, start - 20):start]
            engineering_prefix = re.search(r"\b(?:engineering|engg?\.?)\s+$", prefix, re.IGNORECASE)
            if engineering_prefix:
                start -= len(engineering_prefix.group(0))
                subject_name = f"Engineering {subject_name}"
            subject_mentions.append((start, match.end(), subject_name))

        # Also recognize custom names in phrases such as "an exam in sociology".
        custom_exam_patterns = (
            re.compile(
                r"\b(?:exam|test|quiz)\s+(?:in|for)\s+([A-Za-z][A-Za-z &'-]*?)"
                r"(?=\s+(?:on|about|covering|and|weak|difficult|need|in)\b|[,;.?!\n]|$)",
                re.IGNORECASE,
            ),
            re.compile(
                r"\b((?:[A-Za-z][A-Za-z&'-]*\s+){0,3}[A-Za-z][A-Za-z&'-]*)"
                r"\s+(?:(?:final|midterm|upcoming|board)\s+)?(?:exam|test|quiz)\b",
                re.IGNORECASE,
            ),
        )
        for pattern in custom_exam_patterns:
            for match in pattern.finditer(text):
                name = match.group(1).strip(" -'")
                name = re.sub(
                    r"^(?:(?:i|we)\s+)?(?:(?:have|has)\s+)?(?:an?|the|my|upcoming|next)\s+",
                    "",
                    name,
                    flags=re.IGNORECASE,
                )
                if name and name.lower() not in aliases:
                    subject_mentions.append((match.start(1), match.end(1), name.title()))

        subject_mentions.sort(key=lambda mention: (mention[0], -(mention[1] - mention[0])))
        unique_mentions = []
        for mention in subject_mentions:
            if any(mention[0] < end and mention[1] > start for start, end, _ in unique_mentions):
                continue
            if unique_mentions and mention[2].casefold() == unique_mentions[-1][2].casefold():
                continue
            unique_mentions.append(mention)

        subjects_found = []
        clarification_messages = []
        for index, (start, end, subject_name) in enumerate(unique_mentions):
            segment_end = unique_mentions[index + 1][0] if index + 1 < len(unique_mentions) else len(text)
            segment = text[start:segment_end]
            exam_date = self._date_from_text(segment, today)
            if exam_date is None:
                exam_date = today + timedelta(days=14)
                clarification_messages.append(f"Please confirm the exam date for {subject_name}.")

            topic_match = re.search(
                r"\b(?:weak\s+in|difficult\s+in|struggling\s+with|need\s+(?:help|practice)\s+with|"
                r"focus\s+on|covering|topics?\s*(?:include|are))\s+(.+)",
                segment,
                re.IGNORECASE,
            )
            topic_names = []
            if topic_match:
                topic_text = re.split(r"[.!?;\n]", topic_match.group(1), maxsplit=1)[0]
                topic_text = re.sub(r"\s+(?:for|before)\s+(?:the\s+)?exam\b.*$", "", topic_text, flags=re.IGNORECASE)
                topic_names = [
                    re.sub(r"^(?:the|a|an)\s+", "", name.strip(" ,:-"), flags=re.IGNORECASE)
                    for name in re.split(r",|\band\b", topic_text, flags=re.IGNORECASE)
                    if name.strip(" ,:-")
                ]

            difficulty = 4 if topic_match and re.search(r"weak|difficult|struggling", topic_match.group(0), re.IGNORECASE) else 3
            confidence = 2 if difficulty == 4 else 3
            weight_match = re.search(
                r"\b(?:weightage|importance)\s*(?:of|is|:)?\s*(10(?:\.0+)?|[1-9](?:\.\d+)?)",
                segment,
                re.IGNORECASE,
            )
            weightage = float(weight_match.group(1)) if weight_match else 5.0
            subjects_found.append({
                "subject_name": subject_name,
                "exam_date": exam_date.strftime("%Y-%m-%d"),
                "weightage": weightage,
                "topics": [
                    {
                        "topic_name": name,
                        "difficulty": difficulty,
                        "confidence": confidence,
                        "estimated_hours": 2.0,
                    }
                    for name in topic_names
                ],
            })

            if not topic_names:
                clarification_messages.append(f"Add the topics you want to study for {subject_name}.")

        if not subjects_found:
            clarification_messages.append("Include a subject name and exam date, for example: Physics exam on 20 Oct, weak in optics.")

        return {
            "subjects": subjects_found,
            "clarification_needed": " ".join(clarification_messages) or None,
        }

    @staticmethod
    def _date_from_text(text: str, today):
        """Parse common written and ISO exam dates, returning None when absent or invalid."""
        date_patterns = (
            r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b",
            r"\b(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
            r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+(\d{4}))?\b",
            r"\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|"
            r"Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,?\s+(\d{4}))?\b",
        )
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if not match:
                continue
            try:
                if pattern == date_patterns[0]:
                    return datetime.strptime(match.group(0), "%Y-%m-%d").date()
                day_first = match.group(1).isdigit()
                month_text = match.group(2) if day_first else match.group(1)
                day_text = match.group(1) if day_first else match.group(2)
                year_text = match.group(3)
                month = datetime.strptime(month_text[:3].title(), "%b").month
                year = int(year_text) if year_text else today.year
                candidate = datetime(year, month, int(day_text)).date()
                if not year_text and candidate < today:
                    candidate = candidate.replace(year=year + 1)
                return candidate
            except ValueError:
                continue
        return None

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
