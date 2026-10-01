import requests
import os
import streamlit as st

API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")

def check_backend_health():
    try:
        resp = requests.get(f"{API_BASE_URL}/", timeout=3)
        return resp.status_code == 200, resp.json() if resp.status_code == 200 else {}
    except Exception:
        return False, {}

def parse_goals_api(free_text: str):
    try:
        resp = requests.post(f"{API_BASE_URL}/goals/parse", json={"free_text": free_text}, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        st.error(f"Error connecting to backend API: {e}")
    return None

def create_subject_api(data: dict):
    try:
        resp = requests.post(f"{API_BASE_URL}/subjects", json=data, timeout=5)
        return resp.status_code == 201, resp.json()
    except Exception as e:
        return False, str(e)

def get_subjects_api():
    try:
        resp = requests.get(f"{API_BASE_URL}/subjects", timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return []

def delete_subject_api(subject_id: int):
    try:
        resp = requests.delete(f"{API_BASE_URL}/subjects/{subject_id}", timeout=5)
        return resp.status_code == 204
    except Exception:
        return False

def save_availability_api(payload: list):
    try:
        resp = requests.post(f"{API_BASE_URL}/availability", json=payload, timeout=5)
        return resp.status_code == 200, resp.json()
    except Exception as e:
        return False, str(e)

def get_availability_api():
    try:
        resp = requests.get(f"{API_BASE_URL}/availability", timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return []

def generate_plan_api(start_date_str: str = None):
    try:
        payload = {"start_date": start_date_str} if start_date_str else {}
        resp = requests.post(f"{API_BASE_URL}/plan/generate", json=payload, timeout=15)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        st.error(f"Failed to generate study plan: {e}")
    return None

def get_plan_api():
    try:
        resp = requests.get(f"{API_BASE_URL}/plan", timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return []

def update_session_status_api(session_id: int, status: str, minutes_spent: int = 0, note: str = ""):
    try:
        payload = {"status": status, "minutes_spent": minutes_spent, "note": note}
        resp = requests.patch(f"{API_BASE_URL}/sessions/{session_id}", json=payload, timeout=5)
        return resp.status_code == 200, resp.json()
    except Exception as e:
        return False, str(e)

def replan_api():
    try:
        resp = requests.post(f"{API_BASE_URL}/plan/replan", json={}, timeout=15)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        st.error(f"Re-plan failed: {e}")
    return None

def get_ics_download_url():
    return f"{API_BASE_URL}/plan/export.ics"
