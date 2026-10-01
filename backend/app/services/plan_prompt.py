import calendar
import re
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple


WEEKDAYS = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}
DAYPARTS = {
    "morning": (6 * 60, 12 * 60),
    "afternoon": (12 * 60, 17 * 60),
    "evening": (17 * 60, 22 * 60),
    "night": (18 * 60, 23 * 60),
}
GATE_SUBJECT_TERMS = (
    "engineering",
    "mathematics",
    "math",
    "physics",
    "chemistry",
    "computer",
    "dbms",
    "database",
    "operating system",
    "data structure",
    "algorithm",
    "computer network",
    "theory of computation",
    "compiler",
    "electrical",
    "electronics",
    "mechanical",
    "civil",
    "aptitude",
    "data science",
    "architecture",
)


def select_prompt_subjects(
    prompt: str,
    subjects: List[Dict[str, Any]],
) -> Tuple[Optional[List[int]], List[str]]:
    """Select saved subjects that match an explicit exam or subject request."""
    text = (prompt or "").strip().lower()
    if re.search(r"\bgate\b", text):
        branch_match = re.search(
            r"\bgate(?:\s+exam)?\s+(?:in\s+|for\s+)?(cse|cs|ece|ee|me|ce)\b"
            r"|\b(?:branch|paper)\s*(?:is\s+|:\s*)?(cse|cs|ece|ee|me|ce)\b",
            text,
        )
        branch_terms = {
            "cse": (
                "computer", "dbms", "database", "operating system", "data structure",
                "algorithm", "computer network", "theory of computation", "compiler",
                "mathematics", "math", "aptitude",
            ),
            "cs": (
                "computer", "dbms", "database", "operating system", "data structure",
                "algorithm", "computer network", "theory of computation", "compiler",
                "mathematics", "math", "aptitude",
            ),
            "ece": ("electronics", "electrical", "physics", "mathematics", "engineering"),
            "ee": ("electrical", "electronics", "mathematics", "engineering"),
            "me": ("mechanical", "mathematics", "engineering"),
            "ce": ("civil", "mathematics", "engineering"),
        }
        branch = (branch_match.group(1) or branch_match.group(2)) if branch_match else None
        terms = branch_terms[branch] if branch else GATE_SUBJECT_TERMS
        matching_subjects = [
            subject
            for subject in subjects
            if any(term in subject["name"].casefold() for term in terms)
        ]
        if not matching_subjects:
            return [], [
                "No saved subjects match this GATE request. Add your GATE paper subjects and topics first; the existing plan was left unchanged."
            ]
        names = ", ".join(subject["name"] for subject in matching_subjects)
        return [subject["id"] for subject in matching_subjects], [
            f"GATE exam detected; built this schedule from your matching saved subjects: {names}."
        ]

    if re.search(r"\b(?:exam|test|timetable|time table|study plan|prepare|preparation)\b", text):
        matching_subjects = []
        for subject in subjects:
            subject_name = subject["name"].casefold()
            subject_terms = {subject_name}
            if subject_name.startswith("engineering "):
                subject_terms.add(subject_name.removeprefix("engineering "))
            if "mathematics" in subject_name:
                subject_terms.add("math")
            if any(term and re.search(rf"(?<!\w){re.escape(term)}(?!\w)", text) for term in subject_terms):
                matching_subjects.append(subject)
        if matching_subjects:
            names = ", ".join(subject["name"] for subject in matching_subjects)
            return [subject["id"] for subject in matching_subjects], [
                f"Scheduled the subjects named in your exam prompt: {names}."
            ]

    return None, []


def extract_prompt_exam_date(prompt: str, plan_start: date) -> Optional[date]:
    """Parse an explicit exam date, including month/year-only deadlines."""
    text = (prompt or "").strip()
    iso_match = re.search(r"\b(20\d{2})-(\d{1,2})-(\d{1,2})\b", text)
    if iso_match:
        try:
            return date(*(int(value) for value in iso_match.groups()))
        except ValueError:
            return None

    month_pattern = (
        r"Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
        r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?"
    )
    match = re.search(rf"\b(\d{{1,2}})\s+({month_pattern})(?:\s+(20\d{{2}}))?\b", text, re.IGNORECASE)
    day_first = bool(match)
    if not match:
        match = re.search(rf"\b({month_pattern})\s+(\d{{1,2}})(?:,?\s+(20\d{{2}}))?\b", text, re.IGNORECASE)
    if match:
        if day_first:
            day_number, month_text, year_text = match.groups()
        else:
            month_text, day_number, year_text = match.groups()
        try:
            month_number = datetime.strptime(month_text[:3].title(), "%b").month
            year_number = int(year_text) if year_text else plan_start.year
            parsed_date = date(year_number, month_number, int(day_number))
            if not year_text and parsed_date <= plan_start:
                parsed_date = parsed_date.replace(year=year_number + 1)
            return parsed_date
        except ValueError:
            return None

    month_year_match = re.search(rf"\b({month_pattern})\s+(20\d{{2}})\b", text, re.IGNORECASE)
    if month_year_match:
        month_number = datetime.strptime(month_year_match.group(1)[:3].title(), "%b").month
        year_number = int(month_year_match.group(2))
        return date(year_number, month_number, calendar.monthrange(year_number, month_number)[1])
    return None


def apply_plan_prompt(
    prompt: str,
    availability: List[Dict[str, Any]],
    subjects: List[Dict[str, Any]],
) -> Tuple[List[Dict[str, Any]], List[int], List[str]]:
    """Apply recognizable scheduling preferences to the planner's real inputs."""
    text = (prompt or "").strip().lower()
    notes = []
    if not text:
        return availability, [], notes

    excluded_days = set()
    if re.search(r"\b(?:no|avoid|skip|exclude|off)\s+(?:the\s+)?weekends?\b|\bweekdays?\s+only\b", text):
        excluded_days.update((5, 6))
        notes.append("Scheduled on weekdays only.")
    if re.search(r"\bweekends?\s+only\b", text):
        excluded_days.update((0, 1, 2, 3, 4))
        notes.append("Scheduled on weekends only.")

    for name, weekday in WEEKDAYS.items():
        if re.search(rf"\b(?:no|avoid|skip|exclude|not on)\s+(?:on\s+)?{name}s?\b", text):
            excluded_days.add(weekday)
            notes.append(f"Skipped {name.title()}s.")

    time_window = next((window for name, window in DAYPARTS.items() if re.search(rf"\b{name}s?\b", text)), None)
    if time_window:
        notes.append(f"Used available time between {time_window[0] // 60:02d}:00 and {time_window[1] // 60:02d}:00 where possible.")

    if not availability:
        availability = [
            {"weekday": weekday, "start": "18:00", "end": "21:00"}
            for weekday in range(7)
        ]

    filtered_availability = []
    for slot in availability:
        if slot["weekday"] in excluded_days:
            continue
        start_minute = _to_minutes(slot["start"])
        end_minute = _to_minutes(slot["end"])
        if time_window:
            start_minute = max(start_minute, time_window[0])
            end_minute = min(end_minute, time_window[1])
        if end_minute > start_minute:
            filtered_availability.append({
                **slot,
                "start": _to_time(start_minute),
                "end": _to_time(end_minute),
            })

    hours_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:(?:per|a)\s+day|daily|every\s+day)\b",
        text,
    )
    if hours_match:
        requested_minutes = min(24 * 60, round(float(hours_match.group(1)) * 60))
        if requested_minutes > 0:
            notes.append(f"Using {requested_minutes / 60:g} study hours per available day as requested.")
            for weekday in {slot["weekday"] for slot in filtered_availability}:
                day_slots = [slot for slot in filtered_availability if slot["weekday"] == weekday]
                day_minutes = sum(_to_minutes(slot["end"]) - _to_minutes(slot["start"]) for slot in day_slots)
                if day_minutes > requested_minutes:
                    remaining = requested_minutes
                    capped_slots = []
                    for slot in sorted(day_slots, key=lambda item: item["start"]):
                        start_minute = _to_minutes(slot["start"])
                        duration = min(_to_minutes(slot["end"]) - start_minute, remaining)
                        if duration > 0:
                            capped_slots.append({
                                **slot,
                                "end": _to_time(start_minute + duration),
                            })
                            remaining -= duration
                        if remaining <= 0:
                            break
                    filtered_availability = [
                        slot for slot in filtered_availability if slot["weekday"] != weekday
                    ] + capped_slots
                    continue
                if day_minutes == requested_minutes:
                    continue
                if time_window and requested_minutes <= time_window[1] - time_window[0]:
                    first_start = min(_to_minutes(slot["start"]) for slot in day_slots)
                    block_start = max(time_window[0], min(first_start, time_window[1] - requested_minutes))
                    new_start = _to_time(block_start)
                    new_end = _to_time(block_start + requested_minutes)
                    filtered_availability = [
                        slot for slot in filtered_availability if slot["weekday"] != weekday
                    ]
                    filtered_availability.append({
                        "weekday": weekday,
                        "start": new_start,
                        "end": new_end,
                    })
                else:
                    last_slot = max(day_slots, key=lambda slot: slot["end"])
                    deficit = requested_minutes - day_minutes
                    extended_end = min(24 * 60 - 1, _to_minutes(last_slot["end"]) + deficit)
                    last_slot["end"] = _to_time(extended_end)

    preferred_subject_ids = []
    for subject in subjects:
        name = subject["name"].lower()
        if name in text and re.search(r"\b(?:prioriti[sz]e|focus on|more time for|start with)\b", text):
            preferred_subject_ids.append(subject["id"])
            notes.append(f"Prioritized {subject['name']}.")

    if not notes and not re.search(r"\bgate\b", text):
        notes.append("No specific day, time, or subject preference was detected; the standard priority order was used.")
    elif time_window and not any(
        _to_minutes(slot["start"]) < time_window[1] and _to_minutes(slot["end"]) > time_window[0]
        for slot in availability
    ):
        notes.append("Your saved availability does not overlap that time of day, so no sessions can be placed there until you update availability.")

    return filtered_availability, preferred_subject_ids, notes


def _to_minutes(value: str) -> int:
    hours, minutes = map(int, value.split(":"))
    return hours * 60 + minutes


def _to_time(value: int) -> str:
    hours, minutes = divmod(value, 60)
    return f"{hours:02d}:{minutes:02d}"