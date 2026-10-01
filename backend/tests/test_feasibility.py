from backend.app.services.feasibility import feasibility_checker

def test_feasibility_checker_overload():
    # 5 topics requiring 10h each = 50h study + 10h revision = 60h total required
    topics = [{"name": f"Topic {i}", "est_hours": 10.0} for i in range(5)]
    # Availability: only 1 hour per day for 7 days = 7 hours total available
    avail = [{"weekday": i, "start": "18:00", "end": "19:00"} for i in range(7)]

    res = feasibility_checker.evaluate(topics, avail, num_days=7)

    assert res["is_feasible"] is False
    assert res["shortfall_hours"] > 0
    assert len(res["suggestions"]) > 0

def test_feasibility_checker_valid():
    topics = [{"name": "Topic 1", "est_hours": 2.0}]
    # 3 hours per day for 7 days = 21 hours available
    avail = [{"weekday": i, "start": "18:00", "end": "21:00"} for i in range(7)]

    res = feasibility_checker.evaluate(topics, avail, num_days=7)
    assert res["is_feasible"] is True
    assert res["shortfall_hours"] == 0
