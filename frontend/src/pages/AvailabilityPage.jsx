import React, { useState, useEffect } from "react";
import { Clock, Check, Sparkles, AlertCircle, Sun, Moon, Calendar } from "lucide-react";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_OPTIONS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
];

export default function AvailabilityPage({
  availability = [],
  busy = false,
  runAction,
  api,
}) {
  const [days, setDays] = useState(
    WEEKDAYS.map((name, weekday) => {
      const slot = availability.find((a) => a.weekday === weekday);
      return {
        weekday,
        name,
        enabled: Boolean(slot),
        start: slot?.start || "18:00",
        end: slot?.end || "21:00",
      };
    })
  );

  useEffect(() => {
    setDays(
      WEEKDAYS.map((name, weekday) => {
        const slot = availability.find((a) => a.weekday === weekday);
        return {
          weekday,
          name,
          enabled: Boolean(slot),
          start: slot?.start || "18:00",
          end: slot?.end || "21:00",
        };
      })
    );
  }, [availability]);

  // Compute total weekly available study hours
  let totalWeeklyHours = 0;
  days.forEach((d) => {
    if (d.enabled) {
      const startHour = parseInt(d.start.split(":")[0], 10);
      const endHour = parseInt(d.end.split(":")[0], 10);
      if (endHour > startHour) {
        totalWeeklyHours += endHour - startHour;
      }
    }
  });

  const activeDaysCount = days.filter((d) => d.enabled).length;

  function applyPreset(type) {
    if (type === "evenings") {
      setDays(
        days.map((d) => ({
          ...d,
          enabled: true,
          start: "18:00",
          end: "21:00",
        }))
      );
    } else if (type === "fulltime") {
      setDays(
        days.map((d) => ({
          ...d,
          enabled: d.weekday < 5, // Mon-Fri
          start: "09:00",
          end: "17:00",
        }))
      );
    } else if (type === "weekends") {
      setDays(
        days.map((d) => ({
          ...d,
          enabled: d.weekday >= 5, // Sat-Sun
          start: "10:00",
          end: "18:00",
        }))
      );
    } else if (type === "balanced") {
      setDays(
        days.map((d) => ({
          ...d,
          enabled: d.weekday !== 6, // Mon-Sat
          start: d.weekday === 5 ? "10:00" : "18:00",
          end: d.weekday === 5 ? "15:00" : "21:00",
        }))
      );
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    const slots = days
      .filter((d) => d.enabled)
      .map(({ weekday, start, end }) => ({ weekday, start, end }));

    await runAction(
      () => api.saveAvailability(slots),
      "Weekly study availability saved successfully!"
    );
  }

  return (
    <div className="availability-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">STUDY ROUTINE & CAPACITY</div>
          <h1>Weekly Study Windows</h1>
          <p>Set available study hours for each day of the week.</p>
        </div>
      </div>

      {/* Preset Banner */}
      <div className="preset-quick-bar">
        <span className="preset-label">Presets:</span>
        <button
          type="button"
          className="button button-outline button-small"
          onClick={() => applyPreset("evenings")}
        >
          <Moon size={14} />
          <span>Evenings (18:00–21:00)</span>
        </button>
        <button
          type="button"
          className="button button-outline button-small"
          onClick={() => applyPreset("fulltime")}
        >
          <Sun size={14} />
          <span>Weekdays (09:00–17:00)</span>
        </button>
        <button
          type="button"
          className="button button-outline button-small"
          onClick={() => applyPreset("balanced")}
        >
          <Sparkles size={14} />
          <span>Balanced (Evenings + Sat)</span>
        </button>
        <button
          type="button"
          className="button button-outline button-small"
          onClick={() => applyPreset("weekends")}
        >
          <Calendar size={14} />
          <span>Weekends Only</span>
        </button>
      </div>

      <div className="availability-layout-grid">
        {/* Main Schedule Form */}
        <section className="panel availability-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">DAYS OF THE WEEK</span>
              <h2>Daily Study Time Slots</h2>
            </div>
            <div className="soft-icon amber">
              <Clock size={20} />
            </div>
          </div>

          <form onSubmit={handleSave} className="availability-days-form">
            <div className="availability-rows-stack">
              {days.map((day, idx) => (
                <div
                  key={day.weekday}
                  className={`availability-row-item ${day.enabled ? "is-active" : "is-off"}`}
                >
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={day.enabled}
                      onChange={(e) =>
                        setDays(
                          days.map((item, i) =>
                            i === idx ? { ...item, enabled: e.target.checked } : item
                          )
                        )
                      }
                    />
                    <span className="switch-slider" />
                    <b>{day.name}</b>
                  </label>

                  {day.enabled ? (
                    <div className="time-picker-controls">
                      <span>From</span>
                      <select
                        value={day.start}
                        onChange={(e) =>
                          setDays(
                            days.map((item, i) =>
                              i === idx ? { ...item, start: e.target.value } : item
                            )
                          )
                        }
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span>to</span>
                      <select
                        value={day.end}
                        onChange={(e) =>
                          setDays(
                            days.map((item, i) =>
                              i === idx ? { ...item, end: e.target.value } : item
                            )
                          )
                        }
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="day-off-label">Day Off / Rest</span>
                  )}
                </div>
              ))}
            </div>

            <div className="form-submit-row" style={{ marginTop: "24px" }}>
              <span className="quiet-hint">
                {activeDaysCount} active days · ~{totalWeeklyHours} hours study capacity / week
              </span>
              <button
                type="submit"
                className="button button-primary button-small"
                disabled={busy}
              >
                <Check size={15} />
                <span>Save Availability</span>
              </button>
            </div>
          </form>
        </section>

        {/* Sidebar Capacity Card */}
        <aside className="panel availability-aside-card">
          <div className="soft-icon emerald">
            <Sparkles size={20} />
          </div>
          <h3>Weekly Study Capacity</h3>
          <p>
            Your timetable engine uses these windows to estimate workload feasibility and ensure you
            never experience study burnout.
          </p>

          <div className="capacity-stat-box">
            <b>{totalWeeklyHours} hrs</b>
            <span>Total Study Window / Week</span>
          </div>

          <div className="capacity-stat-box" style={{ marginTop: "12px" }}>
            <b>{activeDaysCount} Days</b>
            <span>Active Study Days</span>
          </div>

          <div className="study-tip-box">
            <b>💡 Science of Focus:</b>
            <p>
              Students who study consistently 2–3 hours each evening retain 40% more than those who
              cram 10 hours in a single day.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
