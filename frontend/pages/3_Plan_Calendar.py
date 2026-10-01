import streamlit as st
import pandas as pd
from datetime import datetime
from utils import generate_plan_api, get_plan_api, get_ics_download_url

st.set_page_config(page_title="Plan Calendar - AI Study Planner", page_icon="📅", layout="wide")

st.title("📅 Day-Wise Study Plan Calendar")
st.write("Generate your feasible day-wise timetable with spaced revision slots and AI explanations.")

col_btn, col_date = st.columns([2, 2])
start_date = col_date.date_input("Plan Start Date", value=datetime.now().date())

if col_btn.button("🚀 Generate Study Plan", type="primary"):
    with st.spinner("Running Hybrid AI Scheduler..."):
        plan_data = generate_plan_api(start_date.strftime("%Y-%m-%d"))
        if plan_data:
            st.session_state["latest_plan"] = plan_data
            st.success("Study plan generated successfully!")
            st.rerun()

# Check if plan exists
plan_list = get_plan_api()
latest = st.session_state.get("latest_plan", {})

if not plan_list:
    st.info("No active study plan found. Click **Generate Study Plan** above to create one!")
else:
    # 1. Feasibility Warning Banner (Overload detection)
    feasibility = latest.get("feasibility", {})
    if feasibility:
        if not feasibility.get("is_feasible", True):
            st.warning(f"⚠️ **Feasibility Alert: Overload Detected!**\n"
                       f"- **Required Study + Revision:** {feasibility.get('total_required_hours')} hrs\n"
                       f"- **Available Study Hours:** {feasibility.get('total_available_hours')} hrs\n"
                       f"- **Shortfall:** {feasibility.get('shortfall_hours')} hrs\n\n"
                       f"**Suggested Trade-Offs:**\n" + 
                       "\n".join([f"• {s}" for s in feasibility.get("suggestions", [])]))
        else:
            st.success(f"✅ **Feasible Timetable Guaranteed!** Total workload ({feasibility.get('total_required_hours')} hrs) fits within available study windows ({feasibility.get('total_available_hours')} hrs).")

    # 2. AI Rationale & Study Tips
    col_rat, col_tips = st.columns(2)

    with col_rat:
        st.subheader("🤖 AI Schedule Rationale")
        rat_text = latest.get("rationale") or "Sessions are ordered by exam urgency, topic difficulty, and spaced revision rules."
        st.info(rat_text)

    with col_tips:
        st.subheader("💡 Tailored Study Tips")
        tips_list = latest.get("tips") or [
            "Use Active Recall for complex topics.",
            "Review flashcards 1, 3, 7 days after initial learning.",
            "Work in 25-minute Pomodoro focus blocks."
        ]
        for tip in tips_list:
            st.write(f"• {tip}")

    st.markdown("---")

    # 3. Export .ics Calendar Download Button
    ics_url = get_ics_download_url()
    st.markdown(f'<a href="{ics_url}" target="_blank" download="study_plan.ics"><button style="background-color:#4CAF50;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer;font-size:16px;">📥 Export Calendar to .ics (Google / Apple Calendar)</button></a>', unsafe_allow_html=True)

    st.markdown("---")

    # 4. Day-Wise Timetable View
    st.subheader("📋 Day-Wise Timetable")
    df = pd.DataFrame(plan_list)

    if not df.empty:
        # Filter controls
        f_col1, f_col2 = st.columns(2)
        subj_filter = f_col1.multiselect("Filter by Subject", options=df["subject_name"].unique().tolist())
        kind_filter = f_col2.multiselect("Filter Session Type", options=["study", "revision"], default=["study", "revision"])

        if subj_filter:
            df = df[df["subject_name"].isin(subj_filter)]
        if kind_filter:
            df = df[df["kind"].isin(kind_filter)]

        # Format presentation table
        df["kind"] = df["kind"].str.upper()
        df["status"] = df["status"].str.title()
        
        st.dataframe(
            df[["date", "start", "end", "kind", "subject_name", "topic_name", "status"]],
            column_config={
                "date": "Date",
                "start": "Start Time",
                "end": "End Time",
                "kind": "Type",
                "subject_name": "Subject",
                "topic_name": "Topic",
                "status": "Status"
            },
            use_container_width=True
        )
