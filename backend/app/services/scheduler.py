from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from backend.app.services.priority_scorer import priority_scorer
from backend.app.services.effort_estimator import effort_estimator
from backend.app.services.spaced_revision import spaced_revision_service

class GreedyScheduler:
    """Greedy priority scheduler for timetable generation with spaced revision."""

    SESSION_BLOCK_HOURS = 1.0 # Standard 1-hour study block

    @classmethod
    def schedule(
        cls,
        subjects: List[Dict[str, Any]],
        topics: List[Dict[str, Any]],
        availability: List[Dict[str, Any]],
        start_date: date = None
    ) -> List[Dict[str, Any]]:
        
        if start_date is None:
            start_date = datetime.now().date()

        if not availability:
            # Default availability: Mon-Sun 18:00 - 21:00 (3 hours/day)
            availability = [{"weekday": i, "start": "18:00", "end": "21:00"} for i in range(7)]

        # Map weekday to availability time windows
        avail_by_day = {i: [] for i in range(7)}
        for slot in availability:
            avail_by_day[slot["weekday"]].append((slot["start"], slot["end"]))

        # Build subject map
        subj_map = {s["id"]: s for s in subjects}

        # 1. Score and rank topics
        scored_topics = []
        for t in topics:
            subj = subj_map.get(t["subject_id"], {})
            exam_date = subj.get("exam_date", (start_date + timedelta(days=14)).strftime("%Y-%m-%d"))
            weightage = subj.get("weightage", 5.0)
            
            p_score = priority_scorer.calculate_topic_priority(
                exam_date_str=exam_date,
                weightage=weightage,
                difficulty=t.get("difficulty", 3),
                confidence=t.get("confidence", 3),
                ref_date=start_date
            )
            est_h = t.get("est_hours") or effort_estimator.estimate_topic_effort(t.get("difficulty", 3), t.get("confidence", 3))
            
            scored_topics.append({
                "topic": t,
                "subject": subj,
                "priority_score": p_score,
                "est_hours": est_h,
                "remaining_hours": est_h
            })

        # Sort highest priority first
        scored_topics.sort(key=lambda x: x["priority_score"], reverse=True)

        sessions = []
        # Track daily scheduled time intervals to prevent clashes
        # Format: daily_schedule[date_str] = [ (start_minutes, end_minutes), ... ]
        daily_schedule = {}

        def get_free_slot(curr_date: date, duration_minutes: int = 60):
            date_str = curr_date.strftime("%Y-%m-%d")
            weekday = curr_date.weekday()
            slots = avail_by_day.get(weekday, [])
            if not slots:
                slots = [("18:00", "21:00")]

            if date_str not in daily_schedule:
                daily_schedule[date_str] = []

            for start_str, end_str in slots:
                sh, sm = map(int, start_str.split(":"))
                eh, em = map(int, end_str.split(":"))
                window_start = sh * 60 + sm
                window_end = eh * 60 + em

                curr_m = window_start
                while curr_m + duration_minutes <= window_end:
                    proposed_end = curr_m + duration_minutes
                    # Check collision with existing sessions on curr_date
                    overlap = False
                    for ex_start, ex_end in daily_schedule[date_str]:
                        if not (proposed_end <= ex_start or curr_m >= ex_end):
                            overlap = True
                            break

                    if not overlap:
                        daily_schedule[date_str].append((curr_m, proposed_end))
                        s_h, s_m = divmod(curr_m, 60)
                        e_h, e_m = divmod(proposed_end, 60)
                        return f"{s_h:02d}:{s_m:02d}", f"{e_h:02d}:{e_m:02d}"

                    curr_m += 30 # Try next 30-min offset
            return None, None

        # 2. Schedule Study Sessions for each topic
        curr_day_offset = 0
        max_days = 60

        for item in scored_topics:
            t = item["topic"]
            subj = item["subject"]
            rem_h = item["remaining_hours"]
            study_dates_used = []

            day_cursor = 0
            while rem_h > 0 and day_cursor < max_days:
                target_date = start_date + timedelta(days=day_cursor)
                
                # Verify date is before exam date
                if "exam_date" in subj:
                    try:
                        ex_d = datetime.strptime(subj["exam_date"], "%Y-%m-%d").date()
                        if target_date >= ex_d:
                            # Must schedule before exam date
                            day_cursor += 1
                            continue
                    except Exception:
                        pass

                start_t, end_t = get_free_slot(target_date, duration_minutes=60)
                if start_t and end_t:
                    sessions.append({
                        "topic_id": t["id"],
                        "topic_name": t["name"],
                        "subject_name": subj.get("name", "Subject"),
                        "date": target_date.strftime("%Y-%m-%d"),
                        "start": start_t,
                        "end": end_t,
                        "kind": "study",
                        "status": "pending"
                    })
                    rem_h -= 1.0
                    study_dates_used.append(target_date.strftime("%Y-%m-%d"))
                else:
                    day_cursor += 1

            # 3. Schedule Spaced Revisions for this topic
            if study_dates_used:
                first_study_date = study_dates_used[0]
                rev_dates = spaced_revision_service.get_revision_dates(first_study_date)
                for r_date_str in rev_dates:
                    try:
                        r_date = datetime.strptime(r_date_str, "%Y-%m-%d").date()
                        start_t, end_t = get_free_slot(r_date, duration_minutes=30)
                        if start_t and end_t:
                            sessions.append({
                                "topic_id": t["id"],
                                "topic_name": t["name"],
                                "subject_name": subj.get("name", "Subject"),
                                "date": r_date_str,
                                "start": start_t,
                                "end": end_t,
                                "kind": "revision",
                                "status": "pending"
                            })
                    except Exception:
                        pass

        # Sort final sessions chronologically
        sessions.sort(key=lambda x: (x["date"], x["start"]))
        return sessions

scheduler = GreedyScheduler()
