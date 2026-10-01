# 📚 AI-Powered Study Planner

An end-to-end, full-fledged AI-powered study planner that converts goals, subjects, deadlines, and daily availability into a feasible day-wise schedule with spaced revision (1-3-7-14 day intervals), progress tracking, and automatic re-planning when sessions are missed.

Built with **Python 3.11**, **FastAPI**, **SQLite**, **Streamlit**, and **Google Gemini API**.

---

## 🌟 Key Features

- **✨ AI Free-Text Goal Extraction:** Converts natural language goals (e.g. *"Physics exam on 20 Oct, weak in optics"*) into structured subjects, exam dates, topics, difficulty, and confidence ratings using Gemini LLM.
- **📊 Effort & Priority Engine:** Rule-based model estimating topic effort (hours) and weighted priority scores based on urgency, subject weightage, difficulty, and student confidence.
- **📅 Day-Wise Priority Scheduler:** Greedy constraint-based scheduler placing study and spaced repetition revision slots within user-defined daily study availability windows.
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
├── requirements.txt
├── docs/
│   ├── architecture.md
│   ├── demo-script.md
│   └── evaluation-report.md
├── backend/
│   └── app/
│       ├── main.py              # FastAPI Entry Point
│       ├── config.py            # Environment Settings
│       ├── schemas.py           # Pydantic Request/Response Models
│       ├── db/                  # SQLite ORM Database
│       ├── ai/                  # Gemini LLM Client, Hybrid Engine, Prompts & Validators
│       ├── services/            # Estimator, Scorer, Scheduler, Replanner & ICS Export
│       └── api/routes/          # REST API Endpoints
├── frontend/
│   ├── app.py                   # Streamlit Landing Dashboard
│   ├── utils.py                 # Backend API Client
│   └── pages/                   # Multi-Page Streamlit App
│       ├── 1_Goals_and_Subjects.py
│       ├── 2_Availability.py
│       ├── 3_Plan_Calendar.py
│       ├── 4_Today.py
│       └── 5_Progress.py
├── tests/                       # Pytest Suite
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
LLM_MODEL=gemini-2.5-flash
```

---

## 🚀 Running the Project

### 1. Seed Database (Optional)
Populate database with sample subjects, availability, and initial schedule:
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

### 3. Start Streamlit Frontend
In a new terminal window:
```bash
source .venv/bin/activate
streamlit run frontend/app.py
```
- Streamlit Web UI: `http://localhost:8501`

---

## 🧪 Testing & Evaluation

Run the full pytest suite:
```bash
source .venv/bin/activate
pytest tests/
```

Run stress-test evaluation script:
```bash
source .venv/bin/activate
python scripts/evaluate.py
```
