import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
from utils import parse_goals_api, create_subject_api, get_subjects_api, delete_subject_api

st.set_page_config(page_title="Goals & Subjects - AI Study Planner", page_icon="🎯", layout="wide")

st.title("🎯 Goals & Subject Management")
st.write("Add your study goals using AI Free-Text Parsing or structured forms.")

# Tab 1: AI Free-Text Goal Parser | Tab 2: Manual Subject Entry | Tab 3: Current Subjects
tab1, tab2, tab3 = st.tabs(["✨ AI Free-Text Goal Parser", "➕ Manual Subject & Topic Form", "📋 Current Subjects List"])

with tab1:
    st.subheader("Extract Tasks using AI (Gemini)")
    st.write("Describe your upcoming exams, weak topics, and target dates in natural language.")
    
    sample_text = "Physics exam on 20 Oct, weak in optics. Math exam on 25 Oct, difficult in calculus."
    free_text_input = st.text_area(
        "Enter your goals or paste exam syllabus:",
        value=sample_text,
        height=100
    )
    
    if st.button("🚀 Parse Goals with AI", type="primary"):
        with st.spinner("Analyzing text with Gemini LLM..."):
            parsed = parse_goals_api(free_text_input)
            if parsed and "subjects" in parsed:
                st.session_state["parsed_goals"] = parsed["subjects"]
                if parsed.get("clarification_needed"):
                    st.warning(f"⚠️ {parsed['clarification_needed']}")
                st.success("Successfully parsed goals into structured subjects & topics!")
            else:
                st.error("Could not parse text. Please try refining your goal description.")

    if "parsed_goals" in st.session_state and st.session_state["parsed_goals"]:
        st.subheader("Review Extracted Subjects & Save")
        for idx, subj in enumerate(st.session_state["parsed_goals"]):
            with st.expander(f"📖 Subject: {subj['subject_name']} (Exam: {subj['exam_date']})", expanded=True):
                col_s1, col_s2 = st.columns(2)
                subj_name = col_s1.text_input(f"Subject Name #{idx+1}", value=subj['subject_name'], key=f"p_sname_{idx}")
                exam_date = col_s2.date_input(f"Exam Date #{idx+1}", value=datetime.strptime(subj['exam_date'], "%Y-%m-%d").date(), key=f"p_edate_{idx}")
                weightage = st.slider(f"Subject Importance / Weightage (1-10) #{idx+1}", 1.0, 10.0, float(subj.get('weightage', 5.0)), key=f"p_weight_{idx}")

                topics_payload = []
                st.write("**Topics & Estimated Effort:**")
                for tidx, top in enumerate(subj.get("topics", [])):
                    t_col1, t_col2, t_col3, t_col4 = st.columns([3, 2, 2, 2])
                    t_name = t_col1.text_input("Topic Name", value=top['topic_name'], key=f"p_tname_{idx}_{tidx}")
                    diff = t_col2.number_input("Difficulty (1-5)", 1, 5, top.get('difficulty', 3), key=f"p_diff_{idx}_{tidx}")
                    conf = t_col3.number_input("Confidence (1-5)", 1, 5, top.get('confidence', 3), key=f"p_conf_{idx}_{tidx}")
                    est_h = t_col4.number_input("Est Hours", 0.5, 20.0, float(top.get('estimated_hours', 2.0)), key=f"p_esth_{idx}_{tidx}")
                    
                    topics_payload.append({
                        "name": t_name,
                        "difficulty": diff,
                        "confidence": conf,
                        "est_hours": est_h
                    })

                if st.button(f"💾 Save Subject '{subj_name}' to Database", key=f"btn_save_{idx}"):
                    payload = {
                        "name": subj_name,
                        "exam_date": exam_date.strftime("%Y-%m-%d"),
                        "weightage": weightage,
                        "topics": topics_payload
                    }
                    success, res = create_subject_api(payload)
                    if success:
                        st.success(f"Saved {subj_name}!")
                        st.rerun()
                    else:
                        st.error(f"Error: {res}")

with tab2:
    st.subheader("Add Subject & Topics Manually")
    with st.form("manual_subject_form"):
        col1, col2 = st.columns(2)
        m_subj_name = col1.text_input("Subject Name", placeholder="e.g. Computer Science")
        m_exam_date = col2.date_input("Exam Date", value=datetime.now().date() + timedelta(days=14))
        m_weightage = st.slider("Subject Weightage (1 = Low, 10 = High)", 1.0, 10.0, 5.0)

        st.markdown("---")
        st.write("Add Initial Topic:")
        t_col1, t_col2, t_col3, t_col4 = st.columns([3, 2, 2, 2])
        m_tname = t_col1.text_input("Topic Name", placeholder="e.g. Data Structures")
        m_diff = t_col2.number_input("Difficulty (1-5)", 1, 5, 3)
        m_conf = t_col3.number_input("Confidence (1-5)", 1, 5, 3)
        m_esth = t_col4.number_input("Estimated Hours", 0.5, 20.0, 3.0)

        submitted = st.form_submit_button("➕ Save Subject & Topic", type="primary")
        if submitted:
            if not m_subj_name or not m_tname:
                st.error("Please fill in both Subject Name and Topic Name.")
            else:
                payload = {
                    "name": m_subj_name,
                    "exam_date": m_exam_date.strftime("%Y-%m-%d"),
                    "weightage": m_weightage,
                    "topics": [{
                        "name": m_tname,
                        "difficulty": m_diff,
                        "confidence": m_conf,
                        "est_hours": m_esth
                    }]
                }
                success, res = create_subject_api(payload)
                if success:
                    st.success(f"Added Subject '{m_subj_name}'!")
                    st.rerun()
                else:
                    st.error(f"Failed to save: {res}")

with tab3:
    st.subheader("Configured Subjects & Topics")
    subjects = get_subjects_api()
    if not subjects:
        st.info("No subjects added yet. Use Tab 1 (AI Goal Parser) or Tab 2 (Manual Form) to add your subjects!")
    else:
        for s in subjects:
            with st.expander(f"📚 {s['name']} (Exam: {s['exam_date']}, Weightage: {s['weightage']}/10)"):
                t_list = s.get("topics", [])
                if t_list:
                    df = pd.DataFrame(t_list)
                    st.table(df[["id", "name", "est_hours", "difficulty", "confidence"]])
                else:
                    st.write("No topics added under this subject.")
                
                if st.button(f"🗑️ Delete Subject #{s['id']}", key=f"del_subj_{s['id']}"):
                    if delete_subject_api(s['id']):
                        st.success(f"Deleted {s['name']}")
                        st.rerun()
                    else:
                        st.error("Delete failed.")
