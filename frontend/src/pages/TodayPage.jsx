import React, { useState } from "react";
import {
  ListChecks,
  CalendarDays,
  Plus,
  Clock,
  Check,
  X,
  RotateCcw,
  Trash2,
  Timer,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function TodayPage({
  sessions = [],
  tasks = [],
  busy = false,
  runAction,
  api,
  today,
  onStartTimer,
}) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [minutesSpent, setMinutesSpent] = useState({});

  const daySessions = sessions.filter((s) => s.date === selectedDate);
  const dayTasks = tasks.filter((t) => t.task_date === selectedDate);
  const completedTasks = dayTasks.filter((t) => t.status === "completed").length;
  const completedSessions = daySessions.filter((s) => s.status === "completed").length;

  async function handleAddTask(e) {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    await runAction(
      () =>
        api.createDailyTask({
          title: taskTitle.trim(),
          task_date: selectedDate,
          start: taskTime || null,
          note: taskNote.trim() || null,
        }),
      `Added "${taskTitle}" to your day.`
    );
    setTaskTitle("");
    setTaskTime("");
    setTaskNote("");
  }

  const isToday = selectedDate === today;

  return (
    <div className="today-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            {new Intl.DateTimeFormat("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(new Date(`${selectedDate}T12:00:00`))}
          </div>
          <h1>{isToday ? "Today in Focus" : "Daily Agenda"}</h1>
          <p>Sessions and personal action items for today.</p>
        </div>
        <div className="heading-actions">
          <div className="date-picker-wrap">
            <CalendarDays size={16} />
            <span>Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {!isToday && (
              <button
                className="button button-outline button-small"
                onClick={() => setSelectedDate(today)}
              >
                Back to Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Today Overview Card */}
      <div className="today-summary-banner">
        <div className="summary-left">
          <div className="soft-icon emerald">
            <ListChecks size={22} />
          </div>
          <div>
            <b>{daySessions.length + dayTasks.length} Scheduled Items</b>
            <p>
              {completedSessions}/{daySessions.length} sessions · {completedTasks}/{dayTasks.length} tasks completed
            </p>
          </div>
        </div>
        {daySessions.length > 0 && (
          <button
            className="button button-primary button-small"
            onClick={() => onStartTimer(daySessions.find((s) => s.status === "pending") || daySessions[0])}
          >
            <Timer size={15} />
            <span>Start Deep Work</span>
          </button>
        )}
      </div>

      {/* Task Composer */}
      <section className="panel task-composer-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">PERSONAL TO-DOS</span>
            <h2>Add Task</h2>
          </div>
          <div className="soft-icon amber">
            <Plus size={18} />
          </div>
        </div>

        <form onSubmit={handleAddTask} className="task-composer-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="e.g. Read Chapter 4 summary, Solve 10 mock questions..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              className="task-input-title"
            />
            <input
              type="time"
              value={taskTime}
              onChange={(e) => setTaskTime(e.target.value)}
              className="task-input-time"
              title="Scheduled time (optional)"
            />
            <input
              type="text"
              placeholder="Notes or details (optional)"
              value={taskNote}
              onChange={(e) => setTaskNote(e.target.value)}
              className="task-input-note"
            />
            <button
              type="submit"
              className="button button-primary button-small"
              disabled={busy || !taskTitle.trim()}
            >
              <Plus size={15} />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </section>

      {/* Personal Tasks List */}
      <div className="section-row">
        <div>
          <span className="panel-kicker">PERSONAL ACTION ITEMS</span>
          <h2>Tasks & Reminders ({dayTasks.length})</h2>
        </div>
        {dayTasks.length > 0 && (
          <span className="count-pill">{completedTasks} Done</span>
        )}
      </div>

      {dayTasks.length > 0 ? (
        <div className="daily-task-grid">
          {dayTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isMissed = task.status === "missed";
            return (
              <div key={task.id} className={`daily-task-card ${task.status}`}>
                <button
                  className={`task-checkbox ${isCompleted ? "checked" : ""}`}
                  onClick={() =>
                    runAction(
                      () => api.updateDailyTask(task.id, isCompleted ? "pending" : "completed"),
                      isCompleted ? `Restored "${task.title}".` : `Marked "${task.title}" as done!`
                    )
                  }
                  title={isCompleted ? "Mark incomplete" : "Mark completed"}
                >
                  {isCompleted && <Check size={14} />}
                </button>
                <div className="task-content">
                  <h4 className={isCompleted ? "strikethrough" : ""}>{task.title}</h4>
                  <div className="task-meta">
                    {task.start && (
                      <span className="task-time-badge">
                        <Clock size={12} /> {task.start}
                      </span>
                    )}
                    {task.note && <span className="task-note-text">{task.note}</span>}
                  </div>
                </div>
                <div className="task-card-actions">
                  {!isCompleted && !isMissed && (
                    <button
                      className="button button-quiet button-small"
                      onClick={() =>
                        runAction(
                          () => api.updateDailyTask(task.id, "missed"),
                          `Marked "${task.title}" as missed.`
                        )
                      }
                      title="Mark missed"
                    >
                      Missed
                    </button>
                  )}
                  {isMissed && (
                    <button
                      className="button button-quiet button-small"
                      onClick={() =>
                        runAction(
                          () => api.updateDailyTask(task.id, "pending"),
                          `Restored "${task.title}".`
                        )
                      }
                    >
                      Undo
                    </button>
                  )}
                  <button
                    className="icon-button danger-icon"
                    onClick={() =>
                      runAction(
                        () => api.deleteDailyTask(task.id),
                        `Deleted "${task.title}".`
                      )
                    }
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <CheckCircle2 size={22} className="empty-state-icon" />
          <b>No tasks added for this day</b>
          <p>Use the form above to add personal to-dos or reading goals.</p>
        </div>
      )}

      {/* Scheduled Study Sessions for the Day */}
      <div className="section-row" style={{ marginTop: "36px" }}>
        <div>
          <span className="panel-kicker">SCHEDULED STUDY & REVISION</span>
          <h2>Timetable Sessions ({daySessions.length})</h2>
        </div>
      </div>

      {daySessions.length > 0 ? (
        <div className="today-sessions-grid">
          {daySessions.map((sess) => {
            const isCompleted = sess.status === "completed";
            const isMissed = sess.status === "missed";
            const isPending = sess.status === "pending";

            return (
              <div
                key={sess.id}
                className={`today-session-card status-${sess.status} ${sess.kind}`}
              >
                <div className="session-card-header">
                  <div className="session-time-block">
                    <Clock size={15} />
                    <b>{sess.start} – {sess.end}</b>
                  </div>
                  <div className="session-kind-badges">
                    <span className={`kind-tag ${sess.kind}`}>
                      {sess.kind === "revision" ? "Spaced Review" : "Focus Study"}
                    </span>
                    <span className={`status-tag ${sess.status}`}>
                      {sess.status}
                    </span>
                  </div>
                </div>

                <div className="session-card-body">
                  <h3>{sess.topic_name}</h3>
                  <p>{sess.subject_name}</p>
                </div>

                <div className="session-card-footer">
                  {isPending && (
                    <div className="session-pending-controls">
                      <button
                        className="button button-primary button-small"
                        onClick={() => onStartTimer(sess)}
                        title="Start Pomodoro Timer for this topic"
                      >
                        <Timer size={14} />
                        <span>Focus with Timer</span>
                      </button>

                      <div className="quick-complete-row">
                        <label className="minutes-input-label">
                          <span>Mins:</span>
                          <input
                            type="number"
                            min="5"
                            max="360"
                            value={minutesSpent[sess.id] || 60}
                            onChange={(e) =>
                              setMinutesSpent({
                                ...minutesSpent,
                                [sess.id]: Number(e.target.value),
                              })
                            }
                          />
                        </label>
                        <button
                          className="button button-success button-small"
                          onClick={() =>
                            runAction(
                              () =>
                                api.updateSession(
                                  sess.id,
                                  "completed",
                                  minutesSpent[sess.id] || 60
                                ),
                              `Logged "${sess.topic_name}" as completed!`
                            )
                          }
                        >
                          <Check size={14} />
                          <span>Done</span>
                        </button>
                        <button
                          type="button"
                          className="button button-quiet button-small"
                          onClick={() =>
                            runAction(
                              () => api.updateSession(sess.id, "missed"),
                              `Marked "${sess.topic_name}" for re-planning.`
                            )
                          }
                        >
                          Missed
                        </button>
                        <button
                          type="button"
                          className="icon-button danger-icon"
                          onClick={() =>
                            runAction(
                              () => api.deleteSession(sess.id),
                              `Deleted "${sess.topic_name}" from timetable.`
                            )
                          }
                          title="Delete session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="session-resolved-row">
                      <div className="session-done-label">
                        <CheckCircle2 size={16} />
                        <span>Completed ({sess.minutes_spent || 60} mins)</span>
                      </div>
                      <div className="session-resolved-actions">
                        <button
                          type="button"
                          className="button button-quiet button-small"
                          onClick={() =>
                            runAction(
                              () => api.updateSession(sess.id, "pending"),
                              `Restored "${sess.topic_name}" to pending.`
                            )
                          }
                          title="Reset status back to pending"
                        >
                          <RotateCcw size={13} />
                          <span>Reset</span>
                        </button>
                        <button
                          type="button"
                          className="icon-button danger-icon"
                          onClick={() =>
                            runAction(
                              () => api.deleteSession(sess.id),
                              `Deleted "${sess.topic_name}" from timetable.`
                            )
                          }
                          title="Delete completed session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {isMissed && (
                    <div className="session-resolved-row">
                      <div className="session-missed-label">
                        <X size={16} />
                        <span>Marked Missed</span>
                      </div>
                      <div className="session-resolved-actions">
                        <button
                          type="button"
                          className="button button-success button-small"
                          onClick={() =>
                            runAction(
                              () => api.updateSession(sess.id, "completed", 60),
                              `Marked "${sess.topic_name}" as completed!`
                            )
                          }
                          title="Mark completed"
                        >
                          <Check size={13} />
                          <span>Done</span>
                        </button>
                        <button
                          type="button"
                          className="button button-quiet button-small"
                          onClick={() =>
                            runAction(
                              () => api.updateSession(sess.id, "pending"),
                              `Restored "${sess.topic_name}" to pending.`
                            )
                          }
                          title="Reset back to pending"
                        >
                          <RotateCcw size={13} />
                          <span>Reset</span>
                        </button>
                        <button
                          type="button"
                          className="icon-button danger-icon"
                          onClick={() =>
                            runAction(
                              () => api.deleteSession(sess.id),
                              `Deleted "${sess.topic_name}" from timetable.`
                            )
                          }
                          title="Delete missed session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <CalendarDays size={22} className="empty-state-icon" />
          <b>No scheduled study sessions on this date</b>
          <p>
            Your timetable is open. You can work on custom tasks, or generate a fresh schedule under Study Plan.
          </p>
        </div>
      )}
    </div>
  );
}
