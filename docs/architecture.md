# Architecture Overview - AI-Powered Study Planner

## System Architecture

```
+-----------------------------------------------------------------------+
|                         Presentation Layer                            |
|                 Streamlit Multi-Page UI (Python)                      |
| (1. Goals/Subjects | 2. Availability | 3. Calendar | 4. Today | 5. Progress) |
+-----------------------------------------------------------------------+
                                  |
                              REST API (HTTP)
                                  v
+-----------------------------------------------------------------------+
|                            API Layer                                  |
|                         FastAPI Endpoints                             |
|  (/goals/parse, /subjects, /availability, /plan/generate, /plan/replan, /export.ics) |
+-----------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
|                           Planning Core                               |
| Effort Estimator  |  Priority Scorer  | Greedy Scheduler | Feasibility|
+-----------------------------------------------------------------------+
        |                                                     |
        v                                                     v
+-----------------------+                         +---------------------+
|       AI Layer        |                         |     Data Layer      |
| Gemini LLM Provider   |                         | SQLite Database     |
| (Parser & Explainer)  |                         | (ORM SQLAlchemy)    |
+-----------------------+                         +---------------------+
```

## Hybrid AI Engine Design
1. **Constraint-Based Scheduler**: Computes topic effort from difficulty/confidence ratings, scores weighted priorities, and places study and spaced revision sessions (1-3-7-14 day intervals) inside strict student availability windows.
2. **LLM Provider Adapter (Gemini API)**: Operates through versioned prompt templates (`goal_parser.txt`, `rationale.txt`, `tips.txt`, `replan_explanation.txt`) to extract tasks from natural language and generate human-friendly explanations.
3. **Adaptive Replanner**: Dynamically re-allocates missed sessions into upcoming open slots while preserving high-priority exam goals.
