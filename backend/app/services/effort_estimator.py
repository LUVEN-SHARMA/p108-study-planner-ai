class EffortEstimator:
    """Estimates study effort (in hours) based on topic difficulty (1-5) and student confidence (1-5)."""

    BASE_HOURS = 2.5

    @classmethod
    def estimate_topic_effort(cls, difficulty: int, confidence: int, user_override: float = None) -> float:
        if user_override is not None and user_override > 0:
            return round(float(user_override), 1)

        # Enforce bounds
        diff = max(1, min(5, difficulty))
        conf = max(1, min(5, confidence))

        # Formula: Base * (Difficulty / Confidence)
        multiplier = diff / float(conf)
        est = cls.BASE_HOURS * multiplier
        
        # Clamp output between 0.5 and 12.0 hours
        est = max(0.5, min(12.0, est))
        return round(est, 1)

effort_estimator = EffortEstimator()
