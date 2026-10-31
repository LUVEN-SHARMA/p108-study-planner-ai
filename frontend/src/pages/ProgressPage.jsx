import React from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  RefreshCw,
  Flame,
  Award,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default function ProgressPage({
  sessions = [],
  subjects = [],
  completedCount = 0,
}) {
  const missedCount = sessions.filter((s) => s.status === "missed").length;
  const pendingCount = sessions.filter((s) => s.status === "pending").length;
  const completionPercent = sessions.length
    ? Math.round((completedCount / sessions.length) * 100)
    : 0;

  // Total study minutes logged
  const totalMinutesStudied = sessions
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + (s.minutes_spent || 60), 0);
  const totalHoursStudied = (totalMinutesStudied / 60).toFixed(1);

  // Spaced repetition stats
  const revisionSessions = sessions.filter((s) => s.kind === "revision");
  const completedRevisions = revisionSessions.filter((s) => s.status === "completed").length;

  return (
    <div className="progress-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">ANALYTICS & RETENTION METRICS</div>
          <h1>Progress & Velocity</h1>
          <p>Study hours, completion rate, and revision stats.</p>
        </div>
      </div>

      {/* Top Velocity Grid */}
      <div className="progress-top-grid">
        {/* Main Donut Score Card */}
        <section className="panel progress-hero-panel">
          <div
            className="progress-donut-ring"
            style={{
              background: `conic-gradient(var(--emerald) ${completionPercent}%, var(--bg-surface-elevated) 0)`,
            }}
          >
            <div className="donut-inner">
              <b>{completionPercent}%</b>
              <span>Completed</span>
            </div>
          </div>

          <div className="progress-hero-copy">
            <span className="panel-kicker">OVERALL COMPLETION</span>
            <h2>
              {completionPercent >= 80
                ? "Phenomenal Consistency! 🏆"
                : completionPercent >= 40
                ? "Solid Rhythm & Momentum ⚡"
                : "Your First Milestone is Near 🌱"}
            </h2>
            <p>
              {completedCount} of {sessions.length} sessions completed ({totalHoursStudied}h studied).
            </p>
          </div>
        </section>

        {/* 3 Metric Mini Cards */}
        <div className="progress-mini-metrics">
          <div className="panel mini-stat-card">
            <div className="stat-card-icon emerald">
              <CheckCircle2 size={18} />
            </div>
            <b>{completedCount}</b>
            <small>Sessions Done</small>
          </div>

          <div className="panel mini-stat-card">
            <div className="stat-card-icon amber">
              <Clock size={18} />
            </div>
            <b>{pendingCount}</b>
            <small>Upcoming Sessions</small>
          </div>

          <div className="panel mini-stat-card">
            <div className="stat-card-icon rose">
              <RefreshCw size={18} />
            </div>
            <b>{missedCount}</b>
            <small>Missed / To Re-plan</small>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Retention Card */}
      <section className="panel spaced-rep-progress-card">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">RETENTION HEALTH</span>
            <h2>Spaced Repetition Performance</h2>
          </div>
          <div className="soft-icon">
            <Sparkles size={20} />
          </div>
        </div>
        <p className="panel-subtitle">
          Review sessions scheduled at 1, 3, 7, and 14 days to maximize retention.
        </p>

        <div className="intervals-bar-grid">
          <div className="interval-stat">
            <span className="int-step">Step 1</span>
            <b>Day +1</b>
            <small>Quick Review</small>
          </div>
          <div className="interval-arrow">→</div>
          <div className="interval-stat">
            <span className="int-step">Step 2</span>
            <b>Day +3</b>
            <small>Active Recall</small>
          </div>
          <div className="interval-arrow">→</div>
          <div className="interval-stat">
            <span className="int-step">Step 3</span>
            <b>Day +7</b>
            <small>Problem Sets</small>
          </div>
          <div className="interval-arrow">→</div>
          <div className="interval-stat">
            <span className="int-step">Step 4</span>
            <b>Day +14</b>
            <small>Final Mastery</small>
          </div>
        </div>

        <div className="rep-progress-track-row">
          <span>
            Spaced Reviews Completed: <b>{completedRevisions} / {revisionSessions.length}</b>
          </span>
          <div className="momentum-track" style={{ flex: 1, margin: "0 14px" }}>
            <i
              style={{
                width: `${
                  revisionSessions.length
                    ? (completedRevisions / revisionSessions.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <b>
            {revisionSessions.length
              ? Math.round((completedRevisions / revisionSessions.length) * 100)
              : 0}
            %
          </b>
        </div>
      </section>

      {/* Subject-by-Subject Progress */}
      <div className="section-row" style={{ marginTop: "32px" }}>
        <div>
          <span className="panel-kicker">BY SUBJECT</span>
          <h2>Subject Mastery & Completion</h2>
        </div>
      </div>

      {subjects.length > 0 ? (
        <div className="subject-progress-grid">
          {subjects.map((sub) => {
            const subSessions = sessions.filter((s) => s.subject_name === sub.name);
            const subDone = subSessions.filter((s) => s.status === "completed").length;
            const subPercent = subSessions.length
              ? Math.round((subDone / subSessions.length) * 100)
              : 0;

            return (
              <article key={sub.id} className="panel subject-progress-card">
                <div className="sub-progress-header">
                  <div className="sub-monogram">
                    {sub.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="sub-meta">
                    <b>{sub.name}</b>
                    <small>
                      {subDone} of {subSessions.length} sessions completed · Exam: {sub.exam_date}
                    </small>
                  </div>
                  <strong className="sub-percentage">{subPercent}%</strong>
                </div>

                <div className="momentum-track">
                  <i style={{ width: `${subPercent}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <BookOpen size={22} className="empty-state-icon" />
          <b>No subjects tracked yet</b>
          <p>Add subjects and generate a plan to track completion across each topic.</p>
        </div>
      )}
    </div>
  );
}
