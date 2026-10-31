import React, { useState } from "react";
import {
  CalendarDays,
  ListChecks,
  Sparkles,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function PlanPage({
  sessions = [],
  busy = false,
  planDetails,
  setPlanDetails,
  runAction,
  api,
  onStartTimer,
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayStr);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [prompt, setPrompt] = useState("");
  const [filter, setFilter] = useState("all"); // all, study, revision
  const [view, setView] = useState("calendar"); // calendar, list

  // Month navigation state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const promptSuggestions = [
    "GATE exam in Feb 2027, 4 hours per day, weekdays only",
    "Focus heavily on Biology Cell Structure, evenings only",
    "Prepare for Physics midterm next week, prioritize Optics",
    "Evenly balance all subjects across evenings",
  ];

  async function handleGenerate() {
    await runAction(
      () => api.generatePlan(startDate, prompt),
      (result) => `Generated a balanced schedule with ${result.sessions.length} sessions!`,
      (result) => {
        setPlanDetails(result);
        setSelectedDate(startDate);
      }
    );
  }

  async function handleReplan() {
    await runAction(
      () => api.replan(),
      (result) => result.explanation || "Re-allocated missed sessions successfully!",
      (result) => {
        setPlanDetails({ ...result, rationale: result.explanation, tips: [] });
      }
    );
  }

  // Filtered sessions
  const filteredSessions = sessions.filter(
    (s) => filter === "all" || s.kind === filter
  );

  // Calendar math
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7; // Monday as 0
  const totalCells = Math.ceil((startDayOffset + daysInMonth) / 7) * 7;

  const calendarDates = Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(firstDayOfMonth);
    date.setDate(1 - startDayOffset + i);
    return date;
  });

  const sessionsByDate = filteredSessions.reduce((acc, sess) => {
    acc[sess.date] = acc[sess.date] || [];
    acc[sess.date].push(sess);
    return acc;
  }, {});

  const selectedDaySessions = sessionsByDate[selectedDate] || [];

  return (
    <div className="plan-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">ADAPTIVE TIMETABLE & SCHEDULER</div>
          <h1>Study Plan & Calendar</h1>
          <p>A structured day-by-day roadmap with automated spaced revision and deadline guarantees.</p>
        </div>
        <div className="heading-actions">
          <a
            className="button button-outline"
            href={api.exportUrl}
            download="studyplan.ics"
            title="Download iCalendar file for Google, Apple, or Outlook"
          >
            <Download size={16} />
            <span>Export to Calendar (.ics)</span>
          </a>
        </div>
      </div>

      {/* AI Schedule Prompt Builder */}
      <section className="panel prompt-builder-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">AI-POWERED SCHEDULE BUILDER</span>
            <h2>Customize Timing & Subject Priorities</h2>
          </div>
          <div className="soft-icon">
            <Sparkles size={20} />
          </div>
        </div>

        <p className="panel-subtitle">
          Enter natural language constraints like study hours, preferred timing, or subjects to prioritize.
        </p>

        <div className="prompt-controls-grid">
          <div className="prompt-input-group">
            <textarea
              rows="3"
              placeholder="e.g. Prepare 3 hours per day, weekdays only, prioritize Optics and Calculus..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="prompt-textarea"
            />
            <div className="prompt-suggestion-chips">
              <span className="chips-label">Quick Presets:</span>
              {promptSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  className="chip-btn"
                  onClick={() => setPrompt(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="prompt-meta-group">
            <label className="field-group">
              <span>Start Plan From Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="start-date-input"
              />
            </label>
            <button
              type="button"
              className="button button-primary generate-plan-btn"
              disabled={busy || !startDate}
              onClick={handleGenerate}
            >
              {busy ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Building Timetable...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate AI Timetable</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt Notes Applied */}
        {planDetails?.prompt_notes?.length > 0 && (
          <div className="prompt-applied-box">
            <CheckCircle2 size={16} className="applied-icon" />
            <div>
              <b>Prompt Rules Applied:</b>
              <ul>
                {planDetails.prompt_notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Feasibility Alert */}
        {planDetails?.feasibility && (
          <div
            className={`feasibility-card ${
              planDetails.feasibility.is_feasible ? "feasible" : "overloaded"
            }`}
          >
            {planDetails.feasibility.is_feasible ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
            <div className="feasibility-content">
              <b>
                {planDetails.feasibility.is_feasible
                  ? "Schedule is Feasible & Realistic!"
                  : "Workload Overload Detected"}
              </b>
              <p>
                Estimated Workload: {planDetails.feasibility.total_required_hours}h required ·{" "}
                {planDetails.feasibility.total_available_hours}h available in your weekly study windows.
                {!planDetails.feasibility.is_feasible &&
                  ` (Shortfall of ${planDetails.feasibility.shortfall_hours} hours)`}
              </p>
              {!planDetails.feasibility.is_feasible &&
                planDetails.feasibility.suggestions?.map((sug, i) => (
                  <small key={i} className="suggestion-bullet">
                    💡 {sug}
                  </small>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* Schedule Controls Bar */}
      <div className="section-row" style={{ marginTop: "32px" }}>
        <div>
          <span className="panel-kicker">GENERATED SESSIONS</span>
          <h2>
            Timetable Overview <span className="count-pill">{filteredSessions.length} Sessions</span>
          </h2>
        </div>

        <div className="plan-filter-actions">
          {/* View Toggle */}
          <div className="view-toggle-bar">
            <button
              className={`toggle-tab ${view === "calendar" ? "active" : ""}`}
              onClick={() => setView("calendar")}
            >
              <CalendarDays size={15} />
              <span>Calendar</span>
            </button>
            <button
              className={`toggle-tab ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              <ListChecks size={15} />
              <span>List View</span>
            </button>
          </div>

          {/* Session Kind Filter */}
          <div className="kind-filter-select">
            <Filter size={14} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Sessions</option>
              <option value="study">Study Only</option>
              <option value="revision">Spaced Reviews</option>
            </select>
          </div>

          {/* Re-plan Button */}
          <button
            className="button button-outline button-small"
            disabled={busy || !sessions.length}
            onClick={handleReplan}
            title="Automatically reschedule any missed sessions into future slots"
          >
            <RefreshCw size={14} className={busy ? "spin" : ""} />
            <span>Re-plan Missed Work</span>
          </button>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {view === "calendar" ? (
        <div className="calendar-container">
          <section className="panel calendar-panel">
            <div className="calendar-header">
              <h3>
                {currentMonth.toLocaleDateString("en", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <div className="calendar-nav">
                <button
                  className="icon-button"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                    )
                  }
                  title="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className="calendar-today"
                  onClick={() => {
                    const now = new Date();
                    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                    setSelectedDate(todayStr);
                  }}
                >
                  Current Month
                </button>
                <button
                  className="icon-button"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                    )
                  }
                  title="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="calendar-grid calendar-weekdays">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="calendar-grid calendar-days">
              {calendarDates.map((date) => {
                const dateKey = date.toISOString().slice(0, 10);
                const daySessions = sessionsByDate[dateKey] || [];
                const inMonth = date.getMonth() === currentMonth.getMonth();
                const isSelected = dateKey === selectedDate;
                const isToday = dateKey === todayStr;

                return (
                  <div
                    key={dateKey}
                    className={`calendar-day ${inMonth ? "" : "outside-month"} ${
                      isSelected ? "selected-day" : ""
                    } ${isToday ? "today-day" : ""}`}
                    onClick={() => {
                      setSelectedDate(dateKey);
                      if (!inMonth) {
                        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                      }
                    }}
                  >
                    <span className="calendar-day-number">{date.getDate()}</span>
                    {daySessions.length > 0 && (
                      <span className="calendar-event-count">
                        {daySessions.length} {daySessions.length === 1 ? "session" : "sessions"}
                      </span>
                    )}
                    <div className="calendar-event-list">
                      {daySessions.slice(0, 3).map((s) => (
                        <div
                          key={s.id}
                          className={`calendar-event-pill ${s.kind}`}
                          title={`${s.start} ${s.topic_name} (${s.subject_name})`}
                        >
                          {s.start} {s.topic_name}
                        </div>
                      ))}
                      {daySessions.length > 3 && (
                        <small style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                          +{daySessions.length - 3} more
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Selected Day Agenda */}
          <div className="selected-day-agenda">
            <div className="section-row">
              <div>
                <span className="panel-kicker">SELECTED DAY AGENDA</span>
                <h3>
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
              </div>
              <span className="count-pill">{selectedDaySessions.length} Sessions</span>
            </div>

            {selectedDaySessions.length > 0 ? (
              <div className="session-list">
                {selectedDaySessions.map((session) => (
                  <div key={session.id} className="session-row">
                    <div className={`session-type ${session.kind === "revision" ? "revision" : ""}`}>
                      <span>{session.kind === "revision" ? "RECAP" : "STUDY"}</span>
                    </div>
                    <div className="session-info">
                      <b>{session.topic_name}</b>
                      <span>{session.subject_name}</span>
                    </div>
                    <div className="session-time">
                      <Clock size={14} />
                      <span>{session.start} – {session.end}</span>
                    </div>
                    <button
                      className="button button-outline button-small"
                      onClick={() => onStartTimer(session)}
                    >
                      Focus
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <CalendarDays size={20} className="empty-state-icon" />
                <b>No sessions scheduled for this day</b>
                <p>Pick a day with scheduled sessions or generate a plan from today.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="session-list">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div key={session.id} className="session-row">
                <div className={`session-type ${session.kind === "revision" ? "revision" : ""}`}>
                  <span>{session.kind === "revision" ? "RECAP" : "STUDY"}</span>
                </div>
                <div className="session-info">
                  <b>{session.topic_name}</b>
                  <span>
                    {session.subject_name} · {session.date}
                  </span>
                </div>
                <div className="session-time">
                  <Clock size={14} />
                  <span>{session.start} – {session.end}</span>
                </div>
                <button
                  className="button button-outline button-small"
                  onClick={() => onStartTimer(session)}
                >
                  Focus
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <CalendarDays size={20} className="empty-state-icon" />
              <b>No sessions match your filter</b>
              <p>Try switching to "All Sessions" or generate your schedule above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
