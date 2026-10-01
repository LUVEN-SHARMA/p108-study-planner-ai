# Architecture Overview - AI-Powered Study Planner

## System Architecture

```
+-----------------------------------------------------------------------+
|                         Presentation Layer                            |
|                 React + Vite Web Application                          |
| (Landing | Goals/Subjects | Availability | Calendar | Today | Progress)  |
+-----------------------------------------------------------------------+
                                  |
                              REST API (HTTP)
                                  v
+-----------------------------------------------------------------------+
|                            API Layer                                  |
|                         FastAPI Endpoints                             |
| (/goals/parse, /subjects, /availability, /plan/generate, /daily-tasks, /plan/replan) |
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
|       Engines         |                         |     Data Layer      |
| Gemini + validators   |                         | SQLAlchemy models   |
| Prompt templates      |                         | Repository adapters|
+-----------------------+                         +---------------------+
```

## Hybrid AI Engine Design
1. **Constraint-Based Scheduler**: Computes topic effort from difficulty/confidence ratings, scores weighted priorities, and places study and spaced revision sessions (1-3-7-14 day intervals) inside strict student availability windows.
2. **LLM Provider Adapter (Gemini API)**: Operates through task prompt templates in `prompts/tasks/` to extract goals from natural language and generate human-friendly explanations.
3. **Adaptive Replanner**: Dynamically re-allocates missed sessions into upcoming open slots while preserving high-priority exam goals.

## Repository Layers

- `frontend/src/pages/` contains routed React screens; shared UI belongs in `components/`, API access in `services/`, and browser contracts in `types/`.
- `backend/app/api/routes/` validates HTTP requests and delegates persistence to repositories and planning work to services/engines.
- `backend/app/domain/` defines persistent entities; `schemas/` defines request/response contracts; `core/` provides settings and shared infrastructure.
- `prompts/tasks/` contains task-specific Gemini instructions. `prompts/system/` is for shared model guidance, and `prompts/versions/` holds reviewed snapshots when needed.
- `data/sample/subjects.json` is the shared sample dataset consumed by both the UI's sample endpoint and the seed script.
- The retired Streamlit interface is retained at `legacy/streamlit-app/`; the primary interface is React.
