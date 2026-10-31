import React from "react";
import {
  TrendingUp,
  CalendarDays,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle2,
  Timer,
  BookOpen,
  RefreshCw,
  Flame,
  Check,
  X,
} from "lucide-react";

export default function OverviewPage({
  profile,
  subjects = [],
  sessions = [],
  todaySessions = [],
  completedCount = 0,
  onNavigate,
  onStartTimer,
  onUpdateSession,
}) {
  const firstName = profile?.name ? profile.name.split(" ")[0] : "Student";
  const pendingCount = sessions.filter((s) => s.status === "pending").length;
  const missedCount = sessions.filter((s) => s.status === "missed").length;
  const completionRate = sessions.length ? Math.round((completedCount / sessions.length) * 100) : 0;

  // Next upcoming exam
  const sortedByExam = [...subjects].sort((a, b) => a.exam_date.localeCompare(b.exam_date));
  const nextExam = sortedByExam[0];

  let daysToExam = 0;
  if (nextExam?.exam_date) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const diffTime = new Date(`${nextExam.exam_date}T00:00:00`) - new Date(`${todayStr}T00:00:00`);
    daysToExam = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Next 4 upcoming sessions
  const nextSessions = [...sessions]
    .filter((s) => s.status === "pending")
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
    .slice(0, 4);

  // Spaced repetition sessions count
  const revisionSessions = sessions.filter((s) => s.kind === "revision");

  return (
    <div className="overview-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            {new Intl.DateTimeFormat("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(new Date())}
          </div>
          <h1>
            Welcome back, <em>{firstName}</em>.
          </h1>
          <p>
            {profile?.goal
              ? `Goal: ${profile.goal}`
              : "Track daily progress and upcoming targets."}
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-primary"
            onClick={() => onStartTimer()}
            title="Launch 25-minute Pomodoro Timer"
          >
            <Timer size={16} />
            <span>Start Focus Timer</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Momentum Stats & Deadline */}
      <div className="overview-grid">
        <section className="panel overview-main">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">STUDY MOMENTUM</span>
              <h2>Overall Schedule Progress</h2>
            </div>
            <div className="soft-icon emerald">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-card">
              <b>{subjects.length.toString().padStart(2, "0")}</b>
              <span>Active Subjects</span>
            </div>
            <div className="metric-card">
              <b>{pendingCount.toString().padStart(2, "0")}</b>
              <span>Sessions Ahead</span>
            </div>
            <div className="metric-card">
              <b style={{ color: "var(--emerald)" }}>
                {completedCount.toString().padStart(2, "0")}
              </b>
              <span>Completed Sessions</span>
            </div>
          </div>

          <div className="momentum-track">
            <i style={{ width: `${completionRate}%` }} />
          </div>
          <div className="track-foot">
            <span>{completedCount} of {sessions.length} sessions completed</span>
            <b>{completionRate}% Done</b>
          </div>
        </section>

        {/* Deadline Card */}
        <section className="panel deadline-panel">
          <span className="panel-kicker">NEAREST DEADLINE</span>
          <div className="deadline-date">
            <CalendarDays size={24} />
            <span>
              {nextExam
                ? new Date(`${nextExam.exam_date}T12:00:00`).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </span>
          </div>
          <b>{nextExam?.name || "No upcoming exam set"}</b>
          <p>
            {nextExam
              ? `${daysToExam} days left · ${nextExam.topics?.length || 0} topics`
              : "Add subjects and exam dates in Goals & Subjects."}
          </p>

          <div className="deadline-panel-footer">
            <button
              className="button button-outline button-small"
              onClick={() => onNavigate("Goals & subjects")}
            >
              <span>Manage Subjects</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </div>

      {/* Spaced Repetition Health Banner */}
      {revisionSessions.length > 0 && (
        <div className="spaced-rep-banner">
          <div className="spaced-rep-icon">
            <Sparkles size={18} />
          </div>
          <div className="spaced-rep-text">
            <b>Spaced Repetition Active · {revisionSessions.length} review slots</b>
            <p>Automated reviews scheduled at 1, 3, 7, and 14-day intervals.</p>
          </div>
          <button
            className="button button-outline button-small"
            onClick={() => onNavigate("Study plan")}
          >
            <span>View Timeline</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Up Next Study Sessions */}
      <div className="section-row">
        <div>
          <span className="panel-kicker">UP NEXT IN YOUR TIMETABLE</span>
          <h2>Next Study & Revision Slots</h2>
        </div>
        <button className="button button-quiet button-small" onClick={() => onNavigate("Study plan")}>
          <span>Full Schedule</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {nextSessions.length > 0 ? (
        <div className="session-list">
          {nextSessions.map((session) => (
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
                <span>{session.start}–{session.end}</span>
              </div>
              <div className="session-actions-group">
                <button
                  className="button button-outline button-small"
                  onClick={() => onStartTimer(session)}
                  title="Focus on this topic with Pomodoro timer"
                >
                  <Timer size={14} />
                  <span>Focus</span>
                </button>
                <button
                  className="icon-button"
                  onClick={() => onUpdateSession(session.id, "completed", 60)}
                  title="Mark as Done"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <CalendarDays size={22} />
          </div>
          <b>No pending sessions scheduled</b>
          <p>
            {sessions.length > 0
              ? "All scheduled sessions are complete."
              : "Add subjects and generate your schedule to get started."}
          </p>
          <button
            className="button button-primary button-small"
            onClick={() => onNavigate(sessions.length ? "Progress" : "Study plan")}
          >
            {sessions.length ? "View Progress & Stats" : "Generate Study Schedule"}
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="quick-actions">
        <button className="quick-action-card" onClick={() => onNavigate("Goals & subjects")}>
          <div className="soft-icon">
            <Plus size={18} />
          </div>
          <span>Add Subject or Topic</span>
          <ArrowRight size={16} />
        </button>

        <button className="quick-action-card" onClick={() => onNavigate("Availability")}>
          <div className="soft-icon amber">
            <Clock size={18} />
          </div>
          <span>Adjust Study Hours</span>
          <ArrowRight size={16} />
        </button>

        <button className="quick-action-card" onClick={() => onNavigate("Today")}>
          <div className="soft-icon emerald">
            <CheckCircle2 size={18} />
          </div>
          <span>Check Today's Agenda</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
