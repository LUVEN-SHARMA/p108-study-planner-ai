import streamlit as st
from datetime import time
from utils import save_availability_api, get_availability_api

st.set_page_config(page_title="Availability Setup - AI Study Planner", page_icon="⏰", layout="wide")

st.title("⏰ Daily Study Availability Setup")
st.write("Configure your daily study windows (start and end times) for Monday through Sunday.")

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

existing_avail = get_availability_api()
avail_map = {item["weekday"]: item for item in existing_avail}

st.markdown("---")

form_data = []

with st.form("availability_form"):
    st.write("### Set Available Hours per Day")
    
    for idx, day_name in enumerate(WEEKDAYS):
        st.write(f"**{day_name}**")
        col1, col2, col3 = st.columns([1, 2, 2])
        
        is_active = col1.checkbox("Active", value=(idx in avail_map), key=f"active_{idx}")
        
        default_start = time(18, 0)
        default_end = time(21, 0)

        if idx in avail_map:
            try:
                sh, sm = map(int, avail_map[idx]["start"].split(":"))
                eh, em = map(int, avail_map[idx]["end"].split(":"))
                default_start = time(sh, sm)
                default_end = time(eh, em)
            except Exception:
                pass

        start_t = col2.time_input(f"Start Time", value=default_start, key=f"start_{idx}")
        end_t = col3.time_input(f"End Time", value=default_end, key=f"end_{idx}")

        if is_active:
            form_data.append({
                "weekday": idx,
                "start": start_t.strftime("%H:%M"),
                "end": end_t.strftime("%H:%M")
            })

    submitted = st.form_submit_button("💾 Save Weekly Availability", type="primary")

    if submitted:
        if not form_data:
            st.warning("Please activate at least one weekday study window.")
        else:
            success, res = save_availability_api(form_data)
            if success:
                st.success("Weekly study availability successfully saved!")
                st.rerun()
            else:
                st.error(f"Failed to save availability: {res}")
