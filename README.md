# 📚 AI-Powered Study Planner

An end-to-end, full-fledged AI-powered study planner that converts goals, subjects, deadlines, and daily availability into a feasible day-wise schedule with spaced revision (1-3-7-14 day intervals), progress tracking, and automatic re-planning when sessions are missed.

Built with **FastAPI**, **SQLite**, **React**, **Vite**, and the **Google Gemini API**. The original Streamlit interface remains available under `legacy/streamlit-app/`.

---

## 🌟 Key Features

- **✨ AI Free-Text Goal Extraction:** Converts natural language goals (e.g. *"Physics exam on 20 Oct, weak in optics"*) into structured subjects, exam dates, topics, difficulty, and confidence ratings using Gemini LLM.
- **📊 Effort & Priority Engine:** Rule-based model estimating topic effort (hours) and weighted priority scores based on urgency, subject weightage, difficulty, and student confidence.
- **📅 Day-Wise Priority Scheduler:** Greedy constraint-based scheduler placing study and spaced repetition revision slots within user-defined daily study availability windows.
- **🗓️ Prompt-Guided Calendar:** Add natural-language timing and subject priorities when generating a plan, then browse sessions in a month calendar or list.
- **⚠️ Feasibility Validator:** Detects student workload overload before showing plans and proposes actionable trade-offs.
- **🔄 Adaptive One-Click Re-Plan:** Automatically re-allocates missed study sessions into future open slots without breaking exam deadlines.
- **📥 .ics Calendar Export:** One-click download for syncing timetables with Google Calendar, Apple Calendar, or Outlook.

---

## 🏗️ Repository Architecture

```
.
├── README.md
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── configs/
│   └── project.yaml
├── data/
│   └── sample/subjects.json
├── prompts/
│   ├── system/
│   ├── tasks/
│   └── versions/
├── requirements.txt
├── docs/
│   ├── architecture.md
│   ├── demo-script.md
│   └── evaluation-report.md
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI entry point
│       ├── api/routes/          # REST endpoints
│       ├── core/                # Settings and shared infrastructure
│       ├── schemas/             # Pydantic API contracts
│       ├── domain/              # SQLAlchemy domain models
│       ├── engines/             # Gemini client, hybrid engine, validators
│       ├── services/            # Scheduling, effort, replanning, export
│       ├── repositories/        # Persistence queries
│       ├── db/                  # SQLAlchemy engine and sessions
│       └── tests/               # API and planner tests
├── frontend/
│   ├── src/
│   │   ├── components/          # Shared interface components
│   │   ├── pages/               # Landing, login, and planner screens
│   │   ├── services/            # FastAPI client
│   │   └── types/               # Frontend data contracts
│   └── package.json
├── legacy/streamlit-app/        # Optional original Streamlit interface
└── scripts/                     # Seed Data & Evaluation Scripts
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Python **3.11**

### 2. Environment Setup (venv)
```bash
# Create Python 3.11 virtual environment
python3.11 -m venv .venv

# Activate environment
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 3. API Key Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Edit `.env` to add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
LLM_PROVIDER=gemini
LLM_MODEL=gemini-3.8-flash
```

---

### 4. Install React dependencies
```bash
cd frontend
npm install
cd ..
```

## 🚀 Running the Project

### 1. Seed Database (Optional)
Populate the database with sample subjects, availability, and an initial schedule:
```bash
source .venv/bin/activate
python scripts/seed_data.py
```

### 2. Start FastAPI Backend
```bash
source .venv/bin/activate
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- Backend API Docs: `http://127.0.0.1:8000/docs`

### 3. Start the React Frontend
In a new terminal window:
```bash
cd frontend
npm run dev
```
- React Web UI: `http://127.0.0.1:5173`
- Set `VITE_API_BASE_URL` if the FastAPI backend is not at `http://127.0.0.1:8000`.
- In **Study plan**, enter preferences such as “Weekdays only, evenings, prioritize Biology” before generating. The calendar shows scheduled sessions by date; choose a day to view its agenda.

### 4. Optional: Start the legacy Streamlit Frontend
In a new terminal window:
```bash
source .venv/bin/activate
streamlit run legacy/streamlit-app/app.py
```
- Streamlit Web UI: `http://localhost:8501`

### Run with Docker Compose
After creating `.env` from `.env.example` and adding your Gemini key:
```bash
docker compose up --build
```
- React Web UI: `http://127.0.0.1:5173`
- FastAPI docs: `http://127.0.0.1:8000/docs`

---

## 🧪 Testing & Evaluation

Run the full pytest suite:
```bash
source .venv/bin/activate
pytest backend/tests/
```

Run stress-test evaluation script:
```bash
source .venv/bin/activate
python scripts/evaluate.py
```
