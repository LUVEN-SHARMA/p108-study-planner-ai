import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
from utils import (
    check_backend_health,
    parse_goals_api,
    create_subject_api,
    load_sample_dataset_api,
    get_subjects_api,
    delete_subject_api,
)

st.set_page_config(page_title="Goals & Subjects - AI Study Planner", page_icon="🎯", layout="wide")

st.title("🎯 Goals & Subjects")
st.write("Add sample data, enter subjects manually, or turn study goals into a plan.")

subjects_tab, manual_tab, ai_tab = st.tabs(["📋 Subjects", "➕ Add Subject", "✨ AI Goal Parser"])

with ai_tab:
    st.subheader("Extract Tasks using AI (Gemini)")
    st.write("Describe your upcoming exams, weak topics, and target dates in natural language.")
    
    free_text_input = st.text_area(
        "Enter your goals or paste exam syllabus:",
        placeholder="e.g. Physics exam on 20 Oct, weak in optics. Math exam on 25 Oct, difficult in calculus.",
        height=100
    )
    
    if st.button("🚀 Parse Goals with AI", type="primary"):
        with st.spinner("Analyzing text with Gemini LLM..."):
            parsed = parse_goals_api(free_text_input)
            if parsed and "subjects" in parsed:
                st.session_state["parsed_goals"] = parsed["subjects"]
                if parsed.get("clarification_needed"):
                    st.warning(f"⚠️ {parsed['clarification_needed']}")
                if parsed.get("parser_mode") == "local":
                    st.warning("Gemini was unavailable, so these results were extracted locally from your text.")
                elif parsed["subjects"]:
                    st.success("Successfully parsed your goals into structured subjects and topics.")
                else:
                    st.error("No subjects were found. Add a subject name and exam details, then try again.")
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

with manual_tab:
    st.subheader("Add Subject & Topics Manually")
    topic_count = int(st.number_input("Number of topics", min_value=1, max_value=10, value=1))
    with st.form("manual_subject_form"):
        col1, col2 = st.columns(2)
        m_subj_name = col1.text_input("Subject Name", placeholder="e.g. Computer Science")
        m_exam_date = col2.date_input("Exam Date", value=datetime.now().date() + timedelta(days=14))
        m_weightage = st.slider("Subject Weightage (1 = Low, 10 = High)", 1.0, 10.0, 5.0)

        topics_payload = []
        for topic_index in range(topic_count):
            st.markdown(f"**Topic {topic_index + 1}**")
            t_col1, t_col2, t_col3, t_col4 = st.columns([3, 2, 2, 2])
            topic_name = t_col1.text_input(
                "Topic Name",
                placeholder="e.g. Data Structures",
                key=f"manual_topic_name_{topic_index}",
            )
            difficulty = t_col2.number_input(
                "Difficulty (1-5)", 1, 5, 3, key=f"manual_topic_difficulty_{topic_index}"
            )
            confidence = t_col3.number_input(
                "Confidence (1-5)", 1, 5, 3, key=f"manual_topic_confidence_{topic_index}"
            )
            estimated_hours = t_col4.number_input(
                "Estimated Hours", 0.5, 20.0, 3.0, key=f"manual_topic_hours_{topic_index}"
            )
            topics_payload.append({
                "name": topic_name,
                "difficulty": difficulty,
                "confidence": confidence,
                "est_hours": estimated_hours,
            })

        submitted = st.form_submit_button("➕ Save Subject & Topics", type="primary")
        if submitted:
            if not m_subj_name.strip() or any(not topic["name"].strip() for topic in topics_payload):
                st.error("Please enter a subject name and a name for every topic.")
            else:
                payload = {
                    "name": m_subj_name.strip(),
                    "exam_date": m_exam_date.strftime("%Y-%m-%d"),
                    "weightage": m_weightage,
                    "topics": topics_payload,
                }
                success, res = create_subject_api(payload)
                if success:
                    st.session_state["subjects_notice"] = f"Added {m_subj_name.strip()} with {len(topics_payload)} topics."
                    st.rerun()
                else:
                    st.error(f"Failed to save: {res}")

with subjects_tab:
    st.subheader("Your Subjects")
    if "subjects_notice" in st.session_state:
        st.success(st.session_state.pop("subjects_notice"))

    online, _ = check_backend_health()
    if not online:
        st.error("The backend is offline. Start FastAPI to load or save subjects.")
    else:
        subjects = get_subjects_api()
        sample_col, count_col = st.columns([2, 1])
        if sample_col.button("Add Sample Dataset", type="primary"):
            success, result = load_sample_dataset_api()
            if success:
                st.session_state["subjects_notice"] = (
                    f"Added {len(result)} sample subjects. Existing subjects were left unchanged."
                    if result else "The sample dataset is already in your subject list."
                )
                st.rerun()
            st.error(f"Could not load sample data: {result}")

        count_col.metric("Subjects", len(subjects))
        if not subjects:
            st.info("No subjects yet. Add the sample dataset or create a subject in the Add Subject tab.")
        else:
            overview = pd.DataFrame([
                {
                    "Subject": subject["name"],
                    "Exam Date": subject["exam_date"],
                    "Topics": len(subject.get("topics", [])),
                    "Weightage": subject["weightage"],
                }
                for subject in subjects
            ])
            st.table(overview)

            for subject in subjects:
                with st.expander(f"{subject['name']} | Exam: {subject['exam_date']}"):
                    topic_list = subject.get("topics", [])
                    if topic_list:
                        df = pd.DataFrame(topic_list)
                        st.table(df[["id", "name", "est_hours", "difficulty", "confidence"]])
                    else:
                        st.write("No topics added under this subject.")

                    if st.button(f"Delete Subject #{subject['id']}", key=f"del_subj_{subject['id']}"):
                        if delete_subject_api(subject["id"]):
                            st.session_state["subjects_notice"] = f"Deleted {subject['name']}."
                            st.rerun()
                        st.error("Delete failed.")
