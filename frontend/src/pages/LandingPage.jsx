import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  RefreshCw,
  TrendingUp,
  BookOpen,
  ChevronDown,
  Timer,
  Download,
  Flame,
  Check,
  Zap,
} from "lucide-react";
import Brand from "../components/Brand.jsx";

const PREVIEW_WEEK = [
  {
    day: "MON",
    date: "05",
    sessions: [
      { time: "16:00", subject: "Biology", topic: "Cell Structure & Organelles", type: "Study" },
      { time: "18:30", subject: "Mathematics", topic: "Limits & Continuity", type: "Study" },
    ],
  },
  {
    day: "TUE",
    date: "06",
    sessions: [
      { time: "17:00", subject: "Physics", topic: "Wave Optics & Interference", type: "Study" },
      { time: "18:30", subject: "Biology", topic: "Cell Structure Recap (Day 1)", type: "Revision" },
    ],
  },
  {
    day: "WED",
    date: "07",
    sessions: [
      { time: "16:30", subject: "Mathematics", topic: "Derivatives Practice Set", type: "Study" },
    ],
  },
  {
    day: "THU",
    date: "08",
    sessions: [
      { time: "17:00", subject: "Chemistry", topic: "Chemical Equilibrium", type: "Study" },
      { time: "19:00", subject: "Physics", topic: "Wave Optics Recap (Day 2)", type: "Revision" },
    ],
  },
  {
    day: "FRI",
    date: "09",
    sessions: [
      { time: "16:30", subject: "Biology", topic: "Genetics Primer", type: "Study" },
      { time: "18:30", subject: "Biology", topic: "Cell Structure (Day 4)", type: "Revision" },
    ],
  },
  {
    day: "SAT",
    date: "10",
    sessions: [
      { time: "10:00", subject: "Mathematics", topic: "Weekly Calculus Recap", type: "Revision" },
    ],
  },
  { day: "SUN", date: "11", sessions: [] },
];

export default function LandingPage({ currentUser }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [completed, setCompleted] = useState({});

  const day = PREVIEW_WEEK[selectedDay];
  const doneCount = day.sessions.filter((_, idx) => completed[`${selectedDay}-${idx}`]).length;
  const progress = day.sessions.length ? Math.round((doneCount / day.sessions.length) * 100) : 0;

  function scrollToSection(e, id) {
    if (e) e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      try {
        window.history.pushState(null, "", `#${id}`);
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Brand size="large" />
          <nav className="landing-nav-links">
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")}>How it Works</a>
            <a href="#spaced-repetition" onClick={(e) => scrollToSection(e, "spaced-repetition")}>Spaced Repetition</a>
            <a href="#sample-schedule" onClick={(e) => scrollToSection(e, "sample-schedule")}>Interactive Demo</a>
            <a href="#features" onClick={(e) => scrollToSection(e, "features")}>Features</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, "faq")}>FAQ</a>
          </nav>
          <div className="landing-nav-actions">
            {currentUser ? (
              <>
                <Link to="/workspace/overview" className="button button-outline button-small">
                  <span>{currentUser.name}</span>
                </Link>
                <Link to="/workspace/overview" className="button button-primary">
                  <span>Go to Workspace</span>
                  <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="button button-quiet button-small">
                  <span>Sign In</span>
                </Link>
                <Link to="/login" className="button button-primary">
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-badge-sparkle" />
          <span>Intelligent Study Planner & Focus Engine</span>
        </div>
        <h1 className="hero-title">
          Master Any Exam Without the{" "}
          <span className="hero-gradient-text">Burnout & Cramming</span>
        </h1>
        <p className="hero-subtitle">
          Adaptive spaced-repetition schedules that auto-adjust when life happens.
        </p>
        <div className="hero-cta-group">
          <Link
            to={currentUser ? "/workspace/overview" : "/login"}
            className="button button-primary hero-btn"
          >
            <span>{currentUser ? "Open Workspace" : "Get Started (Free)"}</span>
            <ArrowRight size={18} />
          </Link>
          <a
            href="#sample-schedule"
            className="button button-outline hero-btn"
            onClick={(e) => scrollToSection(e, "sample-schedule")}
          >
            <span>Interactive Demo</span>
          </a>
        </div>

        {/* Hero Features Strip */}
        <div className="hero-perks-strip">
          <div className="perk-item">
            <Zap size={16} className="perk-icon" />
            <span>AI Syllabus Extraction</span>
          </div>
          <div className="perk-item">
            <RefreshCw size={16} className="perk-icon" />
            <span>1-Click Re-planning</span>
          </div>
          <div className="perk-item">
            <Timer size={16} className="perk-icon" />
            <span>Pomodoro Deep Work</span>
          </div>
          <div className="perk-item">
            <Download size={16} className="perk-icon" />
            <span>Calendar Sync (.ics)</span>
          </div>
        </div>
      </section>

      {/* How it Works Workflow Section */}
      <section id="how-it-works" className="landing-section how-it-works-section">
        <div className="section-head text-center">
          <div className="section-kicker">WORKFLOW</div>
          <h2>How It Works</h2>
          <p>From syllabus to an adaptive study timetable in four simple steps.</p>
        </div>

        <div className="steps-cards-grid">
          <div className="step-card">
            <div className="step-badge">
              <span className="step-num">01</span>
              <div className="step-icon-wrap">
                <BookOpen size={20} />
              </div>
            </div>
            <h3>Define Syllabus</h3>
            <p>Paste syllabus topics or type your goals. AI extracts subjects, difficulty, and deadlines.</p>
            <div className="step-tag">AI Extraction</div>
          </div>

          <div className="step-card">
            <div className="step-badge">
              <span className="step-num">02</span>
              <div className="step-icon-wrap">
                <Clock size={20} />
              </div>
            </div>
            <h3>Set Availability</h3>
            <p>Choose when you can study each day with flexible time windows and quick presets.</p>
            <div className="step-tag">Custom Windows</div>
          </div>

          <div className="step-card highlight">
            <div className="step-badge">
              <span className="step-num">03</span>
              <div className="step-icon-wrap">
                <Calendar size={20} />
              </div>
            </div>
            <h3>Generate Plan</h3>
            <p>Engine schedules study slots with automated spaced reviews (Days 1, 3, 7, 14).</p>
            <div className="step-tag">Spaced Repetition</div>
          </div>

          <div className="step-card">
            <div className="step-badge">
              <span className="step-num">04</span>
              <div className="step-icon-wrap">
                <RefreshCw size={20} />
              </div>
            </div>
            <h3>Focus & Adapt</h3>
            <p>Study with Pomodoro focus. Miss a day? Click "Auto Re-plan" to rebalance instantly.</p>
            <div className="step-tag">Auto Recovery</div>
          </div>
        </div>
      </section>

      {/* Spaced Repetition Explainer */}
      <section id="spaced-repetition" className="landing-section">
        <div className="section-head text-center">
          <div className="section-kicker">SCIENCE-BACKED RETENTION</div>
          <h2>Spaced Repetition</h2>
          <p>
            Strategic reviews at 1, 3, 7, and 14 days lock concepts into long-term recall.
          </p>
        </div>
        <div className="repetition-cards-grid">
          <div className="rep-card">
            <div className="rep-day">Day 1</div>
            <h4>Initial Study</h4>
            <p>Core deep-work session to learn new concepts and fundamentals.</p>
          </div>
          <div className="rep-card highlight">
            <div className="rep-day">Day 2 (+24h)</div>
            <h4>Quick Recap</h4>
            <p>15-minute review to interrupt early memory decay.</p>
          </div>
          <div className="rep-card">
            <div className="rep-day">Day 4 (+3d)</div>
            <h4>Active Recall</h4>
            <p>Targeted practice problems without looking at notes.</p>
          </div>
          <div className="rep-card">
            <div className="rep-day">Day 11 (+7d)</div>
            <h4>Long-Term Mastery</h4>
            <p>High-level synthesis to solidify retention before exams.</p>
          </div>
        </div>
      </section>

      {/* Interactive Sample Week Preview */}
      <section id="sample-schedule" className="landing-section sample-section">
        <div className="sample-inner">
          <div className="sample-intro">
            <div className="section-kicker">INTERACTIVE DEMO</div>
            <h2>Schedule Preview</h2>
            <p>
              Select any day to preview how study slots and spaced reviews balance out.
            </p>
            <div className="sample-legend">
              <span className="legend-item"><i className="legend-dot study" /> Study Slot</span>
              <span className="legend-item"><i className="legend-dot revision" /> Spaced Revision</span>
            </div>
            <Link to="/workspace/overview" className="button button-primary">
              Build My Personal Plan <ArrowRight size={16} />
            </Link>
          </div>

          <div className="sample-board">
            <div className="sample-board-header">
              <div>
                <span className="panel-kicker">OCTOBER SCHEDULE</span>
                <h3>Week of Oct 5 – 11</h3>
              </div>
              <div className="sample-progress-badge">
                <b>{progress}%</b>
                <small>completed today</small>
              </div>
            </div>

            <div className="sample-progress-bar">
              <div className="sample-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="sample-day-tabs">
              {PREVIEW_WEEK.map((wDay, idx) => (
                <button
                  key={wDay.day}
                  className={`sample-day-tab ${selectedDay === idx ? "active" : ""}`}
                  onClick={() => setSelectedDay(idx)}
                >
                  <span className="tab-day">{wDay.day}</span>
                  <b className="tab-date">{wDay.date}</b>
                  {wDay.sessions.length > 0 && <span className="tab-dot" />}
                </button>
              ))}
            </div>

            <div className="sample-sessions-list">
              {day.sessions.length > 0 ? (
                day.sessions.map((sess, idx) => {
                  const key = `${selectedDay}-${idx}`;
                  const isDone = Boolean(completed[key]);
                  return (
                    <div
                      key={key}
                      className={`sample-session-item ${isDone ? "completed" : ""}`}
                      onClick={() =>
                        setCompleted((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                    >
                      <div className="sess-time">{sess.time}</div>
                      <div className={`sess-type-tag ${sess.type.toLowerCase()}`}>
                        {sess.type}
                      </div>
                      <div className="sess-details">
                        <b>{sess.topic}</b>
                        <small>{sess.subject}</small>
                      </div>
                      <div className="sess-checkbox">
                        {isDone ? <Check size={14} /> : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="sample-rest-state">
                  <Sparkles size={20} className="rest-icon" />
                  <div>
                    <b>Rest Day</b>
                    <small>Recovery time for sustainable progress.</small>
                  </div>
                </div>
              )}
            </div>

            <div className="sample-board-footer">
              <span>💡 Tap any session to toggle completion</span>
              <span>Interactive preview</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="landing-section">
        <div className="section-head text-center">
          <div className="section-kicker">CORE FEATURES</div>
          <h2>Built for Maximum Retention</h2>
          <p>Constraint scheduling and Gemini AI tailored to your study windows.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">
              <Sparkles size={22} />
            </div>
            <h3>AI Goal Extraction</h3>
            <p>Paste raw syllabus notes. AI auto-detects subjects, exam dates, and difficulty.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <Clock size={22} />
            </div>
            <h3>Constraint Scheduler</h3>
            <p>Schedules sessions strictly within your chosen hours and exam deadlines.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <RefreshCw size={22} />
            </div>
            <h3>1-Click Adaptive Re-planning</h3>
            <p>Missed a day? Redistribute incomplete topics into upcoming open slots with one tap.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <TrendingUp size={22} />
            </div>
            <h3>Feasibility Validator</h3>
            <p>Detects workload overload early and suggests realistic daily adjustments.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <Timer size={22} />
            </div>
            <h3>Pomodoro Focus Timer</h3>
            <p>Built-in 25m/50m focus sessions with automatic study-time tracking.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <Download size={22} />
            </div>
            <h3>Calendar Sync (.ics)</h3>
            <p>One-click export to Google Calendar, Apple Calendar, or Outlook.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="landing-section faq-section">
        <div className="section-head text-center">
          <div className="section-kicker">FAQ</div>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-container">
          <details className="faq-item">
            <summary>
              <span>Can I customize my study days and hours?</span>
              <ChevronDown size={18} />
            </summary>
            <p>
              Yes. Set your study days and daily time windows under Weekly Availability. Sessions will only be scheduled inside those hours.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>What happens if I miss a study session?</span>
              <ChevronDown size={18} />
            </summary>
            <p>
              Mark it as missed, then click Re-plan. The engine redistributes the topic into your next open slot before the exam.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>How does AI syllabus extraction work?</span>
              <ChevronDown size={18} />
            </summary>
            <p>
              Gemini AI parses plain-text notes or exam dates into structured subjects, topics, and estimated hours.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>Can I export my plan to an external calendar?</span>
              <ChevronDown size={18} />
            </summary>
            <p>
              Yes. Download a standard .ics file anytime to sync with Google Calendar, Apple Calendar, or Outlook.
            </p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <Brand size="normal" />
          <p>© 2026 Daymark AI. Intelligent study scheduling.</p>
          <div className="footer-links">
            <Link to="/workspace/overview">Launch App</Link>
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">
              API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
