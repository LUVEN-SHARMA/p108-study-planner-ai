from datetime import datetime, date
from typing import List, Dict, Any
from backend.app.services.scheduler import scheduler

class Replanner:
    """Re-plans uncompleted/missed sessions into available future windows."""

    @classmethod
    def replan(
        cls,
        existing_sessions: List[Dict[str, Any]],
        subjects: List[Dict[str, Any]],
        topics: List[Dict[str, Any]],
        availability: List[Dict[str, Any]],
        current_date: date = None
    ) -> List[Dict[str, Any]]:
        
        if current_date is None:
            current_date = datetime.now().date()

        # 1. Keep completed sessions
        completed_sessions = [s for s in existing_sessions if s.get("status") == "completed"]
        
        # 2. Identify topics that need re-scheduling (missed or pending sessions from current_date onwards)
        pending_or_missed = [
            s for s in existing_sessions 
            if s.get("status") in ["missed", "pending"]
        ]

        if not pending_or_missed:
            return existing_sessions

        # Group remaining required hours per topic
        topic_rem_hours = {}
        topic_map = {t["id"]: t for t in topics}
        
        for sess in pending_or_missed:
            tid = sess.get("topic_id")
            if tid not in topic_rem_hours:
                topic_rem_hours[tid] = 0.0
            
            dur = 1.0 if sess.get("kind") == "study" else 0.5
            topic_rem_hours[tid] += dur

        replan_topics = []
        for tid, hours in topic_rem_hours.items():
            if tid in topic_map:
                t_copy = dict(topic_map[tid])
                t_copy["est_hours"] = hours
                replan_topics.append(t_copy)

        # 3. Re-schedule remaining work from current_date onwards
        new_sessions = scheduler.schedule(
            subjects=subjects,
            topics=replan_topics,
            availability=availability,
            start_date=current_date
        )

        # 4. Combine completed sessions with newly scheduled sessions
        final_schedule = completed_sessions + new_sessions
        final_schedule.sort(key=lambda x: (x["date"], x["start"]))
        return final_schedule

replanner = Replanner()
