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
          <span>Next-Gen Spaced Repetition & Study Scheduler</span>
        </div>
        <h1 className="hero-title">
          Master Any Exam Without the{" "}
          <span className="hero-gradient-text">Burnout & Cramming</span>
        </h1>
        <p className="hero-subtitle">
          Turn your chaotic syllabus, exam deadlines, and daily hours into an adaptive,
          spaced-repetition study schedule. Auto-adjusts when you miss a session.
        </p>
        <div className="hero-cta-group">
          <Link
            to={currentUser ? "/workspace/overview" : "/login"}
            className="button button-primary hero-btn"
          >
            <span>{currentUser ? "Open Your Workspace" : "Get Started (Free)"}</span>
            <ArrowRight size={18} />
          </Link>
          <a
            href="#sample-schedule"
            className="button button-outline hero-btn"
            onClick={(e) => scrollToSection(e, "sample-schedule")}
          >
            <span>Explore Interactive Week</span>
          </a>
        </div>

        {/* Hero Features Strip */}
        <div className="hero-perks-strip">
          <div className="perk-item">
            <Zap size={16} className="perk-icon" />
            <span>AI Free-Text Goal Parsing</span>
          </div>
          <div className="perk-item">
            <RefreshCw size={16} className="perk-icon" />
            <span>1-Click Adaptive Re-planning</span>
          </div>
          <div className="perk-item">
            <Timer size={16} className="perk-icon" />
            <span>Integrated Pomodoro Deep Work</span>
          </div>
          <div className="perk-item">
            <Download size={16} className="perk-icon" />
            <span>.ics Google & Apple Calendar Sync</span>
          </div>
        </div>
      </section>

      {/* How it Works Workflow Section */}
      <section id="how-it-works" className="landing-section how-it-works-section">
        <div className="section-head text-center">
          <div className="section-kicker">STREAMLINED 4-STEP WORKFLOW</div>
          <h2>How Daymark Works</h2>
          <p>
            Go from a messy syllabus and upcoming exam dates to an adaptive, balanced daily study schedule in four simple steps.
          </p>
        </div>

        <div className="steps-cards-grid">
          <div className="step-card">
            <div className="step-badge">
              <span className="step-num">01</span>
              <div className="step-icon-wrap">
                <BookOpen size={20} />
              </div>
            </div>
            <h3>Define Goals & Syllabus</h3>
            <p>
              Paste raw syllabus topics or type your targets in natural language. Our AI extracts topics, difficulty levels, and deadlines automatically.
            </p>
            <div className="step-tag">AI Goal Extraction</div>
          </div>

          <div className="step-card">
            <div className="step-badge">
              <span className="step-num">02</span>
              <div className="step-icon-wrap">
                <Clock size={20} />
              </div>
            </div>
            <h3>Set Study Availability</h3>
            <p>
              Select your realistic study windows across Monday–Sunday. Choose presets like "Evenings Only" or "Balanced" so you never get overwhelmed.
            </p>
            <div className="step-tag">Custom Windows</div>
          </div>

          <div className="step-card highlight">
            <div className="step-badge">
              <span className="step-num">03</span>
              <div className="step-icon-wrap">
                <Calendar size={20} />
              </div>
            </div>
            <h3>Generate Adaptive Plan</h3>
            <p>
              The greedy heuristic scheduler builds your timetable, inserting scientifically spaced revision sessions (Days 1, 3, 7, and 14) for 90%+ retention.
            </p>
            <div className="step-tag">Spaced Repetition</div>
          </div>

          <div className="step-card">
            <div className="step-badge">
              <span className="step-num">04</span>
              <div className="step-icon-wrap">
                <RefreshCw size={20} />
              </div>
            </div>
            <h3>Focus & 1-Click Re-plan</h3>
            <p>
              Track focus blocks with the built-in Pomodoro timer. If unexpected events arise or you miss a day, click "Auto Re-plan" to rebalance instantly.
            </p>
            <div className="step-tag">Zero-Guilt Recovery</div>
          </div>
        </div>
      </section>

      {/* Spaced Repetition Explainer */}
      <section id="spaced-repetition" className="landing-section">
        <div className="section-head text-center">
          <div className="section-kicker">SCIENCE-BACKED RETENTION</div>
          <h2>Why Spaced Repetition Beats Cramming Every Time</h2>
          <p>
            Without reinforcement, humans forget up to 75% of new material within 48 hours.
            Daymark schedules automatic micro-revision slots at 1, 3, 7, and 14 days so memories lock into long-term recall.
          </p>
        </div>
        <div className="repetition-cards-grid">
          <div className="rep-card">
            <div className="rep-day">Day 1</div>
            <h4>Initial Focus</h4>
            <p>Deep work study slot to grasp core concepts and solve fundamental practice problems.</p>
          </div>
          <div className="rep-card highlight">
            <div className="rep-day">Day 2 (+24h)</div>
            <h4>First Flash Recap</h4>
            <p>15–30 min quick review to interrupt the initial steep drop in the forgetting curve.</p>
          </div>
          <div className="rep-card">
            <div className="rep-day">Day 4 (+3d)</div>
            <h4>Active Recall</h4>
            <p>Targeted problem sets testing comprehension and edge cases without notes.</p>
          </div>
          <div className="rep-card">
            <div className="rep-day">Day 11 (+7d)</div>
            <h4>Permanent Storage</h4>
            <p>High-level synthesis ensuring zero memory degradation heading into exam week.</p>
          </div>
        </div>
      </section>

      {/* Interactive Sample Week Preview */}
      <section id="sample-schedule" className="landing-section sample-section">
        <div className="sample-inner">
          <div className="sample-intro">
            <div className="section-kicker">TRY THE INTERACTIVE PREVIEW</div>
            <h2>Interactive Schedule Demo</h2>
            <p>
              Click any day of the week, check off study sessions, and see how Daymark
              balances intense study slots with automated spaced reviews.
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
                    <b>Scheduled Rest Day</b>
                    <small>Recovery and rest are essential parts of sustainable study.</small>
                  </div>
                </div>
              )}
            </div>

            <div className="sample-board-footer">
              <span>💡 Tap any session above to toggle completion</span>
              <span>Interactive preview only</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="landing-section">
        <div className="section-head text-center">
          <div className="section-kicker">ENGINEERED FOR EXCELLENCE</div>
          <h2>Everything You Need to Ace Your Deadlines</h2>
          <p>Built with modern heuristics, constraint satisfaction algorithms, and Google Gemini LLM.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">
              <Sparkles size={22} />
            </div>
            <h3>Free-Text AI Goal Extraction</h3>
            <p>Paste your natural language goals or syllabus notes. Daymark automatically detects subjects, exam dates, difficulty, and confidence ratings.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <Clock size={22} />
            </div>
            <h3>Intelligent Constraint Scheduler</h3>
            <p>Greedy priority scheduler places sessions only during your chosen availability windows, respecting exam deadlines and weightages.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <RefreshCw size={22} />
            </div>
            <h3>1-Click Adaptive Re-planning</h3>
            <p>Life happens. If you fall sick or miss a session, one click redistributes incomplete topics into future available slots without breaking your exam readiness.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <TrendingUp size={22} />
            </div>
            <h3>Workload Feasibility Validator</h3>
            <p>Detects workload overload before you start and gives actionable trade-off suggestions so you never schedule an impossible 18-hour study cram.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <Timer size={22} />
            </div>
            <h3>Integrated Pomodoro Timer</h3>
            <p>Launch focused 25m or 50m deep work sessions with sound cues directly from your today dashboard, logging study minutes right to your profile.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <Download size={22} />
            </div>
            <h3>Calendar Export (.ics)</h3>
            <p>Sync your personalized study timetable with Google Calendar, Apple Calendar, or Microsoft Outlook with a single click.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="landing-section faq-section">
        <div className="section-head text-center">
          <div className="section-kicker">FREQUENTLY ASKED QUESTIONS</div>
          <h2>Got Questions? We’ve Got Answers.</h2>
        </div>
        <div className="faq-container">
          <details className="faq-item">
            <summary>
              <span>Can I customize my study days and daily hours?</span>
              <ChevronDown size={18} />
            </summary>
            <p>
              Yes! Under Weekly Availability, you can select which days of the week you study and define custom start and end times (e.g. 18:00 to 21:00 on weekdays, 10:00 to 16:00 on weekends). The scheduler never books outside your windows.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>What happens if I miss a scheduled study session?</span>
              <ChevronDown size={18} />
            </summary>
            <p>
              Just click "Missed" on the session card. Then click "Re-plan Missed Work". Daymark's engine identifies the missed topic and fits it into your next available open slot before the exam.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>How does the AI understand free-text exam goals?</span>
              <ChevronDown size={18} />
            </summary>
            <p>
              Daymark uses Google Gemini API to parse natural language like "Physics exam on Nov 15, weak in optics; Calculus exam on Nov 25" into structured subjects, estimated effort hours, and confidence ratings.
            </p>
          </details>

          <details className="faq-item">
            <summary>
              <span>Can I export my study plan to my calendar?</span>
              <ChevronDown size={18} />
            </summary>
            <p>
              Yes! Click "Export .ics" anytime to download a standard iCalendar file that imports seamlessly into Google Calendar, Apple Calendar, or Outlook.
            </p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <Brand size="normal" />
          <p>© 2026 Daymark AI. Built for students who value their time and mental clarity.</p>
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
