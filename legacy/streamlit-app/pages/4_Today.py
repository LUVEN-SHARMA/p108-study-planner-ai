import streamlit as st
from datetime import datetime
from utils import get_plan_api, update_session_status_api

st.set_page_config(page_title="Today's Study View - AI Study Planner", page_icon="📌", layout="wide")

st.title("📌 Today's Study Focus")
today_str = datetime.now().strftime("%Y-%m-%d")
st.write(f"Scheduled sessions for **{today_str}**")

all_sessions = get_plan_api()
today_sessions = [s for s in all_sessions if s["date"] == today_str]

if not today_sessions:
    st.info(f"No study sessions scheduled for today ({today_str}). Enjoy your break or check upcoming days in Plan Calendar!")
else:
    for sess in today_sessions:
        status_color = "🟢" if sess["status"] == "completed" else ("🔴" if sess["status"] == "missed" else "🟡")
        
        with st.container():
            st.markdown(f"### {status_color} [{sess['kind'].upper()}] {sess['subject_name']}: {sess['topic_name']}")
            st.write(f"⏰ **Time:** {sess['start']} - {sess['end']} | **Status:** {sess['status'].title()}")

            col1, col2, col3 = st.columns([2, 2, 3])
            
            with col1:
                if sess["status"] != "completed":
                    mins = st.number_input("Actual Minutes Spent", 10, 180, 60, key=f"mins_{sess['id']}")
                    note = st.text_input("Note (Optional)", placeholder="Understood key formulas", key=f"note_{sess['id']}")
                    if st.button("✅ Mark Completed", key=f"btn_comp_{sess['id']}", type="primary"):
                        ok, msg = update_session_status_api(sess['id'], "completed", mins, note)
                        if ok:
                            st.success("Logged as Completed!")
                            st.rerun()

            with col2:
                if sess["status"] != "missed":
                    if st.button("❌ Mark Missed", key=f"btn_miss_{sess['id']}"):
                        ok, msg = update_session_status_api(sess['id'], "missed")
                        if ok:
                            st.warning("Marked as Missed!")
                            st.rerun()

            st.markdown("---")
