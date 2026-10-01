const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // Keep the HTTP status message when the response has no JSON body.
    }
    throw new Error(detail);
  }
  if (response.status === 204) return null;
  return response.json();
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  health: () => request("/"),
  subjects: () => request("/subjects"),
  createSubject: (subject) => request("/subjects", json("POST", subject)),
  addSamples: () => request("/subjects/sample", { method: "POST" }),
  deleteSubject: (id) => request(`/subjects/${id}`, { method: "DELETE" }),
  parseGoals: (freeText) =>
    request("/goals/parse", json("POST", { free_text: freeText })),
  availability: () => request("/availability"),
  saveAvailability: (slots) => request("/availability", json("POST", slots)),
  plan: () => request("/plan"),
  dailyTasks: (taskDate) =>
    request(`/daily-tasks${taskDate ? `?task_date=${taskDate}` : ""}`),
  createDailyTask: (task) => request("/daily-tasks", json("POST", task)),
  updateDailyTask: (id, status) =>
    request(`/daily-tasks/${id}`, json("PATCH", { status })),
  deleteDailyTask: (id) => request(`/daily-tasks/${id}`, { method: "DELETE" }),
  generatePlan: (startDate, prompt) =>
    request("/plan/generate", json("POST", { start_date: startDate, prompt })),
  replan: () => request("/plan/replan", json("POST", {})),
  updateSession: (id, status, minutesSpent = 0, note = "") =>
    request(
      `/sessions/${id}`,
      json("PATCH", { status, minutes_spent: minutesSpent, note }),
    ),
  exportUrl: `${API_BASE}/plan/export.ics`,
};
