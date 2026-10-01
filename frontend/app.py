import streamlit as st
from utils import check_backend_health, get_subjects_api, get_plan_api

st.set_page_config(
    page_title="AI-Powered Study Planner",
    page_icon="📚",
    layout="wide"
)

st.title("📚 AI-Powered Study Planner")
st.subheader("Day-wise Timetable Generator with Spaced Repetition & Adaptive Re-planning")

# Sidebar - Backend Status
st.sidebar.title("⚙️ System Status")
online, info = check_backend_health()
if online:
    st.sidebar.success(f"🟢 Backend Online\nProvider: {info.get('provider', 'Gemini')}")
else:
    st.sidebar.error("🔴 Backend Offline\nPlease ensure FastAPI backend is running on http://127.0.0.1:8000")

st.markdown("---")

col1, col2, col3 = st.columns(3)

subjects = get_subjects_api()
plan = get_plan_api()

with col1:
    st.metric(label="Total Subjects", value=len(subjects))
with col2:
    st.metric(label="Total Scheduled Sessions", value=len(plan))
with col3:
    completed = len([s for s in plan if s.get("status") == "completed"])
    rate = f"{round((completed / len(plan)) * 100, 1)}%" if plan else "0%"
    st.metric(label="Completion Rate", value=rate)

st.markdown("---")

st.markdown("""
### 🚀 How to use this AI Study Planner:

1. **🎯 1. Goals & Subjects**: Enter free-text study goals or manually add subjects, exam dates, topics, difficulty (1-5), and confidence (1-5).
2. **⏰ 2. Availability**: Set your available study hours for each day of the week (Monday - Sunday).
3. **📅 3. Plan Calendar**: Click **Generate Study Plan** to run our Hybrid AI Engine. View your Day-Wise Timetable, Feasibility Warnings, AI Rationale, and export to **.ics**.
4. **📌 4. Today**: Focus on today's sessions, mark sessions as completed or missed, and log study time.
5. **📈 5. Progress**: View your completion stats and click **One-Click Re-plan** if you missed any study sessions!
""")

st.info("💡 **Pro-Tip:** Open the pages from the sidebar on the left to start planning!")
