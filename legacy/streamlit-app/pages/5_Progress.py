import streamlit as st
import pandas as pd
from utils import get_plan_api, replan_api

st.set_page_config(page_title="Progress & Re-plan - AI Study Planner", page_icon="📈", layout="wide")

st.title("📈 Progress Tracking & Adaptive Re-Planning")

sessions = get_plan_api()

if not sessions:
    st.info("No active study plan to track. Please generate a study plan first.")
else:
    df = pd.DataFrame(sessions)
    total = len(df)
    completed = len(df[df["status"] == "completed"])
    missed = len(df[df["status"] == "missed"])
    pending = len(df[df["status"] == "pending"])

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Sessions", total)
    col2.metric("Completed 🟢", completed)
    col3.metric("Missed 🔴", missed)
    col4.metric("Pending 🟡", pending)

    st.markdown("---")

    # One-Click Re-Plan Section
    st.subheader("🔄 One-Click Adaptive Re-Plan")
    st.write("If you missed any study sessions or fell behind schedule, click below to let the AI re-allocate remaining work into future available windows.")

    if st.button("⚡ Execute One-Click Adaptive Re-Plan", type="primary"):
        with st.spinner("Re-allocating missed topics and generating updated schedule..."):
            replan_result = replan_api()
            if replan_result:
                st.session_state["replan_result"] = replan_result
                st.success("Re-planning completed successfully!")
                st.rerun()

    if "replan_result" in st.session_state:
        res = st.session_state["replan_result"]
        st.subheader("🤖 AI Re-Plan Explanation")
        st.info(res.get("explanation", "Schedule updated."))

    st.markdown("---")

    # Session Status Breakdown Chart
    st.subheader("📊 Session Status Breakdown")
    status_counts = df["status"].value_counts().reset_index()
    status_counts.columns = ["Status", "Count"]
    st.bar_chart(status_counts.set_index("Status"))
