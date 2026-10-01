import React, { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Flame,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { api } from "../services/api.js";
import Brand from "../components/Brand.jsx";

const NAV_ITEMS = [
  { id: "Overview", icon: LayoutDashboard },
  { id: "Goals & subjects", icon: BookOpen },
  { id: "Availability", icon: Clock3 },
  { id: "Study plan", icon: CalendarDays },
  { id: "Today", icon: ListChecks },
  { id: "Progress", icon: TrendingUp },
];
const PAGE_SLUGS = {
  Overview: "overview",
  "Goals & subjects": "subjects",
  Availability: "availability",
  "Study plan": "plan",
  Today: "today",
  Progress: "progress",
};

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
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];
const EMPTY_TOPIC = { name: "", difficulty: 3, confidence: 3, est_hours: 2 };
const PREVIEW_WEEK = [
  {
    day: "MON",
    date: "05",
    sessions: [
      { time: "16:00", subject: "Biology", topic: "Cell structure", type: "Focus" },
      { time: "18:30", subject: "Mathematics", topic: "Limits & continuity", type: "Focus" },
    ],
  },
  {
    day: "TUE",
    date: "06",
    sessions: [
      { time: "17:00", subject: "Physics", topic: "Wave optics", type: "Focus" },
      { time: "18:30", subject: "Biology", topic: "Cell structure", type: "Review" },
    ],
  },
  {
    day: "WED",
    date: "07",
    sessions: [
      { time: "16:30", subject: "Mathematics", topic: "Practice set 04", type: "Focus" },
    ],
  },
  {
    day: "THU",
    date: "08",
    sessions: [
      { time: "17:00", subject: "Chemistry", topic: "Chemical bonds", type: "Focus" },
      { time: "19:00", subject: "Physics", topic: "Wave optics", type: "Review" },
    ],
  },
  {
    day: "FRI",
    date: "09",
    sessions: [
      { time: "16:30", subject: "Biology", topic: "Genetics primer", type: "Focus" },
    ],
  },
  {
    day: "SAT",
    date: "10",
    sessions: [
      { time: "10:00", subject: "Mathematics", topic: "Weekly recap", type: "Review" },
    ],
  },
  { day: "SUN", date: "11", sessions: [] },
];

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem("daymark-profile") || "null");
  } catch {
    return null;
  }
}

function Landing() {
  return (
    <main className="landing">
      <header className="site-nav page-wrap">
        <Link to="/" className="brand-link">
          <Brand />
        </Link>
        <nav className="site-links" aria-label="Main navigation">
          <a href="#approach">The approach</a>
          <a href="#week-preview">Try a sample week</a>
          <a href="#features">What it does</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="site-actions">
          <Link className="nav-login" to="/login">
            Log in
          </Link>
          <Link className="button button-dark button-small" to="/login">
            Open your planner <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>

      <section className="hero page-wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> A calmer way to prepare
          </div>
          <h1>
            Make room for
            <br />
            the <em>aha</em> moments.
          </h1>
          <p className="hero-description">
            A study plan that works around your deadlines, your energy, and the
            rest of your life.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" to="/login">
              Build my study plan <ArrowRight size={17} />
            </Link>
            <a className="text-link" href="#approach">
              See how it works <ArrowDown size={15} />
            </a>
          </div>
          <div className="hero-note">
            <span className="avatar-stack">
              <i>J</i>
              <i>M</i>
              <i>A</i>
            </span>
            <span>Less cramming. More “I’ve got this.”</span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85"
            alt="A student working through notes at a desk"
          />
          <div className="visual-caption">
            <span>YOUR NEXT GOOD STUDY DAY</span>
            <strong>Starts with one clear plan.</strong>
          </div>
          <div className="floating-note">
            <span className="note-icon">
              <Check size={16} />
            </span>
            <span>
              <b>Small steps, big picture</b>
              <small>Your plan adapts as you go.</small>
            </span>
          </div>
          <div className="sun-stamp">
            <Sparkles size={18} />
            <span>
              STUDY
              <br />
              WITH INTENTION
            </span>
          </div>
        </div>
        <div className="hero-index">
          <span>01</span>
          <i /> BUILT FOR REAL STUDENT LIFE
        </div>
      </section>

      <section className="ticker" aria-label="Planner features">
        <div className="ticker-track">
          <span>Less overwhelm</span>
          <b>✳</b>
          <span>Spaced revision</span>
          <b>✳</b>
          <span>Plans that flex</span>
          <b>✳</b>
          <span>Progress you can feel</span>
          <b>✳</b>
          <span>Less overwhelm</span>
          <b>✳</b>
          <span>Spaced revision</span>
        </div>
      </section>

      <section className="approach-section page-wrap" id="approach">
        <div className="section-kicker">A LITTLE STRUCTURE GOES A LONG WAY</div>
        <div className="approach-heading">
          <h2>
            From “where do I start?”
            <br />
            to <em>right here.</em>
          </h2>
          <p>
            Daymark turns a pile of subjects, deadlines, and good intentions
            into a realistic next step.
          </p>
        </div>
        <div className="steps-grid">
          <article className="step">
            <span className="step-number">01</span>
            <Target />
            <h3>Put it all on the table</h3>
            <p>
              Add your subjects, topics, exam dates, and the hours you actually
              have.
            </p>
          </article>
          <article className="step">
            <span className="step-number">02</span>
            <CalendarDays />
            <h3>Get a plan that fits</h3>
            <p>
              Build a day-by-day schedule that respects your time and makes room
              to revise.
            </p>
          </article>
          <article className="step">
            <span className="step-number">03</span>
            <Flame />
            <h3>Keep your momentum</h3>
            <p>
              Track what you finish. If a day slips, re-plan without losing the
              bigger picture.
            </p>
          </article>
        </div>
      </section>

      <WeekPreview />

      <section className="feature-band" id="features">
        <div className="feature-inner page-wrap">
          <div className="feature-copy">
            <div className="section-kicker">YOUR STUDY LIFE, IN ONE PLACE</div>
            <h2>
              Clear priorities.
              <br />
              <em>Less mental clutter.</em>
            </h2>
            <p>
              Know what’s next, what can wait, and when it’s time to take a
              break. Your planner does the sorting so you can focus on learning.
            </p>
            <Link className="button button-dark" to="/login">
              Come on in <ArrowRight size={17} />
            </Link>
          </div>
          <div className="feature-list">
            <div>
              <span>01</span>
              <div>
                <b>AI goal parsing</b>
                <small>
                  Turn a brain-dump into editable subjects and topics.
                </small>
              </div>
              <Sparkles />
            </div>
            <div>
              <span>02</span>
              <div>
                <b>Priority-led scheduling</b>
                <small>Spend time where it matters, before the deadline.</small>
              </div>
              <CalendarDays />
            </div>
            <div>
              <span>03</span>
              <div>
                <b>Spaced revision</b>
                <small>
                  Revisit topics at useful intervals, not all at once.
                </small>
              </div>
              <RefreshCw />
            </div>
            <div>
              <span>04</span>
              <div>
                <b>Flexible progress</b>
                <small>Mark sessions, re-plan missed work, keep moving.</small>
              </div>
              <TrendingUp />
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section page-wrap" id="faq">
        <div className="faq-intro">
          <div className="section-kicker">A FEW GOOD QUESTIONS</div>
          <h2>Before you get<br /><em>started.</em></h2>
          <p>Here’s the short version of how Daymark fits into your study life.</p>
        </div>
        <div className="faq-list">
          <details>
            <summary>Can I change the plan after it’s generated?<ChevronDown size={17} /></summary>
            <p>Yes. Change your availability or subjects, then generate a fresh plan. Mark missed work and use re-plan to move it into future open sessions.</p>
          </details>
          <details>
            <summary>What does the plan prompt understand?<ChevronDown size={17} /></summary>
            <p>It can avoid named weekdays or weekends, focus sessions into morning, afternoon, or evening availability, and prioritize a subject you name.</p>
          </details>
          <details>
            <summary>Is sign-in connected to an account?<ChevronDown size={17} /></summary>
            <p>This demo stores a local profile in your browser. The backend does not yet provide server-side accounts, so don’t use a real password here.</p>
          </details>
        </div>
      </section>

      <footer className="site-footer page-wrap">
        <Link to="/" className="brand-link">
          <Brand />
        </Link>
        <span>A little more direction, every day.</span>
        <Link to="/login">
          Go to your planner <ArrowRight size={15} />
        </Link>
      </footer>
    </main>
  );
}

function WeekPreview() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [completed, setCompleted] = useState({});
  const day = PREVIEW_WEEK[selectedDay];
  const doneCount = day.sessions.filter((_, index) => completed[`${selectedDay}-${index}`]).length;
  const progress = day.sessions.length ? Math.round((doneCount / day.sessions.length) * 100) : 0;

  return (
    <section className="week-preview-band" id="week-preview">
      <div className="week-preview-inner page-wrap">
        <div className="week-preview-copy">
          <span className="section-kicker">A LITTLE PREVIEW, YOUR TURN</span>
          <h2>Plans should feel<br />like <em>possibility.</em></h2>
          <p>Pick a day. Check off a session. See how a small plan can make the week feel more manageable.</p>
          <div className="preview-key"><span><i /> Focus session</span><span><i /> Spaced review</span></div>
          <Link className="button button-dark" to="/login">Make a plan of your own <ArrowRight size={16} /></Link>
        </div>
        <div className="week-preview-board">
          <div className="preview-board-head">
            <div><span className="panel-kicker">A SAMPLE WEEK</span><h3>October 5 – 11</h3></div>
            <span className="preview-progress">{progress}%<small>done today</small></span>
          </div>
          <div className="preview-progress-track"><i style={{ width: `${progress}%` }} /></div>
          <div className="preview-days" role="tablist" aria-label="Sample week days">
            {PREVIEW_WEEK.map((previewDay, index) => (
              <button key={previewDay.day} role="tab" aria-selected={selectedDay === index} className={selectedDay === index ? "active" : ""} onClick={() => setSelectedDay(index)}>
                <span>{previewDay.day}</span><b>{previewDay.date}</b>{previewDay.sessions.length > 0 && <i />}
              </button>
            ))}
          </div>
          <div className="preview-day-heading"><div><span className="panel-kicker">YOUR DAY, AT A GLANCE</span><h4>{new Date(2026, 9, Number(day.date)).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</h4></div><span>{day.sessions.length} {day.sessions.length === 1 ? "session" : "sessions"}</span></div>
          <div className="preview-sessions">
            {day.sessions.length ? day.sessions.map((session, index) => {
              const key = `${selectedDay}-${index}`;
              const isComplete = Boolean(completed[key]);
              return <button key={key} className={`preview-session ${isComplete ? "session-complete" : ""}`} onClick={() => setCompleted((current) => ({ ...current, [key]: !current[key] }))} aria-pressed={isComplete}>
                <span className="preview-session-time">{session.time}</span>
                <span className={`preview-session-marker ${session.type === "Review" ? "review-marker" : ""}`}>{isComplete ? <Check size={14} /> : session.type === "Review" ? <RefreshCw size={14} /> : <BookOpen size={14} />}</span>
                <span className="preview-session-copy"><b>{session.topic}</b><small>{session.subject} · {session.type}</small></span>
                <span className="preview-check">{isComplete ? <Check size={14} /> : <span />}</span>
              </button>;
            }) : <div className="preview-rest-day"><Sparkles size={17} /><span><b>A little breathing room.</b><small>Rest is part of a good plan, too.</small></span></div>}
          </div>
          <div className="preview-board-foot"><span><CheckCircle2 size={14} /> Interactive sample only</span><span>Tap a session to mark it done</span></div>
        </div>
      </div>
    </section>
  );
}

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError("Enter a valid email and a password of at least 4 characters.");
      return;
    }
    const profile = { email, name: email.split("@")[0].replace(/[._-]/g, " ") };
    localStorage.setItem("daymark-profile", JSON.stringify(profile));
    onLogin(profile);
    navigate("/workspace");
  }

  return (
    <main className="login-layout">
      <section className="login-panel">
        <Link to="/" className="brand-link">
          <Brand />
        </Link>
        <div className="login-form-wrap">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> YOUR STUDY SPACE
          </div>
          <h1>
            Good to have
            <br />
            you <em>back.</em>
          </h1>
          <p className="login-subtitle">
            Sign in to pick up where your focus left off.
          </p>
          <form onSubmit={submit} className="login-form">
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                placeholder="At least 4 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={4}
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="button button-dark login-submit" type="submit">
              Continue to planner <ArrowRight size={17} />
            </button>
          </form>
          <div className="demo-notice">
            <LockKeyhole size={16} />
            <p>
              <b>Local demo access</b>
              <br />
              This project doesn’t have server-side accounts yet. Sign-in is
              stored only in this browser.
            </p>
          </div>
          <p className="login-back">
            New here?{" "}
            <Link to="/">
              Explore Daymark <ArrowUpRight size={13} />
            </Link>
          </p>
        </div>
        <span className="login-foot">A plan for your real life.</span>
      </section>
      <aside className="login-image">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85"
          alt="Study materials arranged on a desk"
        />
        <div className="login-image-shade" />
        <div className="login-quote">
          <span>MAKE YOUR TIME COUNT</span>
          <p>
            “You don’t have to see the whole staircase. Just take the first
            step.”
          </p>
          <small>One session at a time.</small>
        </div>
        <Link to="/" className="login-image-mark">
          <Brand inverse />
        </Link>
      </aside>
    </main>
  );
}

function App() {
  const [profile, setProfile] = useState(readProfile);
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          profile ? (
            <Navigate to="/workspace" replace />
          ) : (
            <Login onLogin={setProfile} />
          )
        }
      />
      <Route
        path="/workspace/*"
        element={
          profile ? (
            <Workspace
              profile={profile}
              onLogout={() => {
                localStorage.removeItem("daymark-profile");
                setProfile(null);
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Workspace({ profile, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageSlug = location.pathname.split("/")[2] || "overview";
  const page =
    NAV_ITEMS.find((item) => PAGE_SLUGS[item.id] === pageSlug)?.id ||
    "Overview";
  const [mobileNav, setMobileNav] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [health, setHealth] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);

  async function refreshData() {
    setError("");
    try {
      const [subjectData, sessionData, availabilityData, healthData, taskData] =
        await Promise.all([
          api.subjects(),
          api.plan(),
          api.availability(),
          api.health(),
          api.dailyTasks(),
        ]);
      setSubjects(subjectData);
      setSessions(sessionData);
      setAvailability(availabilityData);
      setDailyTasks(taskData);
      setHealth(healthData.status === "online");
    } catch (requestError) {
      setHealth(false);
      setError(requestError.message || "Could not reach the planner API.");
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function runAction(action, successMessage, after) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await action();
      if (after) after(result);
      await refreshData();
      setNotice(
        typeof successMessage === "function"
          ? successMessage(result)
          : successMessage,
      );
      return result;
    } catch (actionError) {
      setError(
        actionError.message || "Something went wrong. Please try again.",
      );
      return null;
    } finally {
      setBusy(false);
    }
  }

  function selectPage(nextPage) {
    navigate(`/workspace/${PAGE_SLUGS[nextPage]}`);
    setMobileNav(false);
    setNotice("");
    setError("");
  }

  const today = toDateKey(new Date());
  const todaySessions = sessions.filter((session) => session.date === today);
  const todayTasks = dailyTasks.filter((task) => task.task_date === today);
  const completedCount = sessions.filter(
    (session) => session.status === "completed",
  ).length;
  const firstName = profile.name.split(" ")[0] || "Student";

  return (
    <div className="workspace-shell">
      <aside className={`workspace-sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <Link
          to="/workspace/overview"
          className="brand-link workspace-brand"
          onClick={() => selectPage("Overview")}
        >
          <Brand />
        </Link>
        <div className="workspace-label">YOUR DESK</div>
        <nav className="workspace-nav" aria-label="Planner navigation">
          {NAV_ITEMS.map(({ id, icon: Icon }, index) => (
            <button
              key={id}
              className={`workspace-nav-item nav-tone-${index} ${page === id ? "active" : ""}`}
              onClick={() => selectPage(id)}
            >
              <Icon size={18} />
              <span>{id}</span>
              {id === "Today" && todaySessions.length + todayTasks.length > 0 && (
                <i>{todaySessions.length + todayTasks.length}</i>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Sparkles size={16} />
            <p>
              <b>One thing at a time.</b>
              <br />
              Your plan is here when you need it.
            </p>
          </div>
          <div className="profile-row">
            <span className="profile-avatar">
              {firstName.slice(0, 1).toUpperCase()}
            </span>
            <span className="profile-meta">
              <b>{firstName}</b>
              <small>Personal workspace</small>
            </span>
            <button className="icon-button" onClick={onLogout} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <main className="workspace-main">
        <header className="workspace-topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Toggle navigation"
          >
            <Menu size={19} />
          </button>
          <div className="breadcrumb">
            My workspace <span>/</span> <b>{page}</b>
          </div>
          <div className="topbar-right">
            <span className={`api-status ${health ? "is-online" : ""}`}>
              <i />
              {health ? "Planner online" : "API offline"}
            </span>
            <button
              className="icon-button"
              onClick={refreshData}
              title="Refresh planner data"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </header>
        <div className="workspace-content">
          {error && (
            <div className="alert alert-error">
              <CircleHelp size={17} />
              <span>
                {error}
                {!health && " Make sure FastAPI is running on port 8000."}
              </span>
              <button onClick={() => setError("")} aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          )}
          {notice && (
            <div className="alert alert-success">
              <CheckCircle2 size={17} />
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          )}
          {page === "Overview" && (
            <Overview
              firstName={firstName}
              subjects={subjects}
              sessions={sessions}
              todaySessions={todaySessions}
              completedCount={completedCount}
              onNavigate={selectPage}
            />
          )}
          {page === "Goals & subjects" && (
            <SubjectsPage
              subjects={subjects}
              busy={busy}
              runAction={runAction}
            />
          )}
          {page === "Availability" && (
            <AvailabilityPage
              availability={availability}
              busy={busy}
              runAction={runAction}
            />
          )}
          {page === "Study plan" && (
            <PlanPage
              sessions={sessions}
              busy={busy}
              planDetails={planDetails}
              setPlanDetails={setPlanDetails}
              runAction={runAction}
            />
          )}
          {page === "Today" && (
            <TodayPage
              sessions={sessions}
              tasks={dailyTasks}
              busy={busy}
              runAction={runAction}
              today={today}
            />
          )}
          {page === "Progress" && (
            <ProgressPage
              sessions={sessions}
              subjects={subjects}
              completedCount={completedCount}
            />
          )}
        </div>
        <footer className="workspace-footer">
          <div className="workspace-footer-brand">
            <Brand />
            <span>A little more direction, every day.</span>
          </div>
          <nav aria-label="Quick planner navigation">
            {NAV_ITEMS.slice(1).map(({ id }) => (
              <button key={id} onClick={() => selectPage(id)}>{id}</button>
            ))}
          </nav>
          <span className="workspace-footer-note">Built around your time · 2026</span>
        </footer>
      </main>
    </div>
  );
}

function PageHeading({ kicker, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="section-kicker">{kicker}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function Overview({
  firstName,
  subjects,
  sessions,
  todaySessions,
  completedCount,
  onNavigate,
}) {
  const pending = sessions.filter(
    (session) => session.status === "pending",
  ).length;
  const nextDeadline = [...subjects].sort((a, b) =>
    a.exam_date.localeCompare(b.exam_date),
  )[0];
  const nextSessions = [...sessions]
    .filter((session) => session.status === "pending")
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
    .slice(0, 4);
  return (
    <>
      <PageHeading
        kicker={new Intl.DateTimeFormat("en", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
          .format(new Date())
          .toUpperCase()}
        title={
          <>
            A good day to begin,
            <br />
            <em>{firstName}.</em>
          </>
        }
        description="A little focus today makes tomorrow feel lighter."
        action={
          <button
            className="button button-dark"
            onClick={() => onNavigate("Study plan")}
          >
            View study plan <ArrowRight size={16} />
          </button>
        }
      />
      <div className="overview-grid">
        <section className="panel overview-main">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">YOUR MOMENTUM</span>
              <h2>Keep the next step small.</h2>
            </div>
            <span className="soft-icon">
              <TrendingUp size={19} />
            </span>
          </div>
          <div className="metric-row">
            <div>
              <b>{subjects.length.toString().padStart(2, "0")}</b>
              <span>Subjects</span>
            </div>
            <div>
              <b>{pending.toString().padStart(2, "0")}</b>
              <span>Sessions ahead</span>
            </div>
            <div>
              <b>{completedCount.toString().padStart(2, "0")}</b>
              <span>Sessions done</span>
            </div>
          </div>
          <div className="momentum-track">
            <i
              style={{
                width: `${sessions.length ? (completedCount / sessions.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="track-foot">
            <span>Overall progress</span>
            <b>
              {sessions.length
                ? Math.round((completedCount / sessions.length) * 100)
                : 0}
              %
            </b>
          </div>
        </section>
        <section className="panel deadline-panel">
          <span className="panel-kicker">ON YOUR HORIZON</span>
          <div className="deadline-date">
            <CalendarDays size={21} />
            <span>
              {nextDeadline
                ? new Date(
                    `${nextDeadline.exam_date}T12:00:00`,
                  ).toLocaleDateString("en", { month: "short", day: "numeric" })
                : "—"}
            </span>
          </div>
          <b>{nextDeadline?.name || "Your next exam"}</b>
          <p>
            {nextDeadline
              ? `${Math.max(0, Math.ceil((new Date(`${nextDeadline.exam_date}T00:00:00`) - new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00`)) / 86400000))} days to prepare`
              : "Add a subject to see your next deadline."}
          </p>
        </section>
      </div>
      <div className="section-row">
        <div>
          <span className="panel-kicker">UP NEXT</span>
          <h2>Your next study sessions</h2>
        </div>
        <button
          className="text-button"
          onClick={() => onNavigate("Study plan")}
        >
          Full schedule <ArrowRight size={15} />
        </button>
      </div>
      {nextSessions.length ? (
        <div className="session-list">
          {nextSessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Your schedule is open"
          text={
            sessions.length
              ? "You have no pending sessions. Nice work."
              : "Add subjects and generate a plan to see what’s next."
          }
          action={() =>
            onNavigate(sessions.length ? "Progress" : "Goals & subjects")
          }
          actionText={sessions.length ? "See progress" : "Add subjects"}
        />
      )}
      <div className="quick-actions">
        <button onClick={() => onNavigate("Goals & subjects")}>
          <Plus size={17} />
          <span>Add a subject</span>
          <ArrowUpRight size={15} />
        </button>
        <button onClick={() => onNavigate("Availability")}>
          <Clock3 size={17} />
          <span>Set study hours</span>
          <ArrowUpRight size={15} />
        </button>
        <button onClick={() => onNavigate("Today")}>
          <CheckCircle2 size={17} />
          <span>Log today’s work</span>
          <ArrowUpRight size={15} />
        </button>
      </div>
    </>
  );
}

function SessionRow({ session }) {
  return (
    <div className="session-row">
      <div
        className={`session-type ${session.kind === "revision" ? "revision" : ""}`}
      >
        <span>{session.kind === "revision" ? "REV" : "STUDY"}</span>
      </div>
      <div className="session-info">
        <b>{session.topic_name}</b>
        <span>
          {session.subject_name} · {session.date}
        </span>
      </div>
      <div className="session-time">
        <Clock3 size={14} />
        {session.start}–{session.end}
      </div>
      <span
        className={`status-dot status-${session.status}`}
        title={session.status}
      />{" "}
      <ArrowRight className="row-arrow" size={16} />{" "}
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, action, actionText }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={20} />
      </span>
      <b>{title}</b>
      <p>{text}</p>
      {action && (
        <button className="button button-outline button-small" onClick={action}>
          {actionText} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function MonthCalendar({ sessions, selectedDate, setSelectedDate }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const offset = (month.getDay() + 6) % 7;
  const dayCount = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cellCount = Math.ceil((offset + dayCount) / 7) * 7;
  const firstCell = new Date(month.getFullYear(), month.getMonth(), 1 - offset);
  const dates = Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(firstCell);
    date.setDate(firstCell.getDate() + index);
    return date;
  });
  const sessionsByDate = sessions.reduce((grouped, session) => {
    grouped[session.date] = [...(grouped[session.date] || []), session];
    return grouped;
  }, {});
  const selectedSessions = sessionsByDate[selectedDate] || [];

  return (
    <>
      <section className="panel calendar-panel">
        <header className="calendar-header">
          <div>
            <span className="panel-kicker">MONTH VIEW</span>
            <h3>
              {month.toLocaleDateString("en", {
                month: "long",
                year: "numeric",
              })}
            </h3>
          </div>
          <div className="calendar-nav">
            <button
              className="icon-button"
              aria-label="Previous month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="calendar-today"
              onClick={() => {
                const now = new Date();
                setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelectedDate(toDateKey(now));
              }}
            >
              Today
            </button>
            <button
              className="icon-button"
              aria-label="Next month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </header>
        <div className="calendar-grid calendar-weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid calendar-days">
          {dates.map((date) => {
            const dateKey = toDateKey(date);
            const daySessions = sessionsByDate[dateKey] || [];
            const inMonth = date.getMonth() === month.getMonth();
            return (
              <button
                key={dateKey}
                className={`calendar-day ${inMonth ? "" : "outside-month"} ${selectedDate === dateKey ? "selected-day" : ""} ${dateKey === toDateKey(new Date()) ? "today-day" : ""}`}
                onClick={() => {
                  setSelectedDate(dateKey);
                  if (!inMonth)
                    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                }}
                aria-label={`${date.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}, ${daySessions.length} sessions`}
              >
                <span className="calendar-day-number">{date.getDate()}</span>
                {daySessions.length > 0 && (
                  <span className="calendar-event-count">
                    {daySessions.length}{" "}
                    {daySessions.length === 1 ? "session" : "sessions"}
                  </span>
                )}
                <span className="calendar-event-list">
                  {daySessions.slice(0, 2).map((session) => (
                    <i
                      key={session.id}
                      className={
                        session.kind === "revision" ? "revision-event" : ""
                      }
                    >
                      {session.start} {session.topic_name}
                    </i>
                  ))}
                  {daySessions.length > 2 && (
                    <small>+{daySessions.length - 2} more</small>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <div className="calendar-agenda-heading">
        <div>
          <span className="panel-kicker">DAY AGENDA</span>
          <h3>
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
        </div>
        <span className="count-pill">{selectedSessions.length} sessions</span>
      </div>
      {selectedSessions.length ? (
        <div className="session-list">
          {selectedSessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="calendar-empty">
          No sessions scheduled for this day.
        </div>
      )}
    </>
  );
}

function SubjectsPage({ subjects, busy, runAction }) {
  const [goalText, setGoalText] = useState("");
  const [parsed, setParsed] = useState([]);
  const [parserMode, setParserMode] = useState("");
  const [clarification, setClarification] = useState("");
  const [form, setForm] = useState({
    name: "",
    exam_date: "",
    weightage: 5,
    topics: [{ ...EMPTY_TOPIC }],
  });

  async function parseGoals(event) {
    event.preventDefault();
    await runAction(
      () => api.parseGoals(goalText),
      (result) =>
        result.clarification_needed ||
        (result.parser_mode === "local"
          ? "Goals extracted using local parsing. Gemini may be unavailable."
          : "Goals parsed with Gemini."),
      (result) => {
        setParsed(result.subjects || []);
        setParserMode(result.parser_mode || "gemini");
        setClarification(result.clarification_needed || "");
      },
    );
  }

  function updateTopic(index, key, value) {
    setForm((current) => ({
      ...current,
      topics: current.topics.map((topic, topicIndex) =>
        topicIndex === index ? { ...topic, [key]: value } : topic,
      ),
    }));
  }

  async function saveManual(event) {
    event.preventDefault();
    const payload = {
      ...form,
      topics: form.topics.filter((topic) => topic.name.trim()),
    };
    const saved = await runAction(
      () => api.createSubject(payload),
      `Added ${form.name}.`,
    );
    if (saved)
      setForm({
        name: "",
        exam_date: "",
        weightage: 5,
        topics: [{ ...EMPTY_TOPIC }],
      });
  }

  return (
    <>
      <PageHeading
        kicker="MAKE A PLAN THAT FITS"
        title="Goals & subjects"
        description="Put your exams and the topics on your mind in one place."
        action={
          <button
            className="button button-outline"
            disabled={busy}
            onClick={() =>
              runAction(
                () => api.addSamples(),
                (result) =>
                  result.length
                    ? `Added ${result.length} sample subjects.`
                    : "Sample subjects are already in your list.",
              )
            }
          >
            {" "}
            <Plus size={16} /> Add sample set
          </button>
        }
      />
      <div className="subjects-layout">
        <div className="subjects-main-column">
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">START WITH A BRAIN-DUMP</span>
                <h2>Let AI sort the first draft.</h2>
              </div>
              <span className="soft-icon lime">
                <Sparkles size={19} />
              </span>
            </div>
            <p className="panel-description">
              Write subjects, exam dates, and any topics you want to focus on.
              Review everything before it’s saved.
            </p>
            <form onSubmit={parseGoals}>
              <label className="field-label" htmlFor="goalText">
                Your goals
                <textarea
                  id="goalText"
                  rows="4"
                  placeholder="e.g. Physics exam on 20 Oct, weak in optics. Math exam on 25 Oct, need practice with calculus."
                  value={goalText}
                  onChange={(event) => setGoalText(event.target.value)}
                  required
                />
              </label>
              <div className="form-footer">
                <span className="quiet-note">
                  Nothing is saved until you review and choose a subject.
                </span>
                <button
                  className="button button-dark button-small"
                  disabled={busy}
                >
                  {busy ? "Working…" : "Parse my goals"} <Sparkles size={15} />
                </button>
              </div>
            </form>
            {clarification && <p className="inline-hint">{clarification}</p>}
            {parsed.length > 0 && (
              <div className="parsed-list">
                <div className="parsed-heading">
                  <b>Review extracted subjects</b>
                  <span className={`parser-tag ${parserMode}`}>
                    {parserMode === "local" ? "Local parsing" : "Gemini"}
                  </span>
                </div>
                {parsed.map((subject, index) => (
                  <article
                    className="parsed-subject"
                    key={`${subject.subject_name}-${index}`}
                  >
                    <div>
                      <b>{subject.subject_name}</b>
                      <span>
                        Exam {subject.exam_date} · {subject.topics.length}{" "}
                        topics
                      </span>
                    </div>
                    <button
                      className="button button-outline button-small"
                      disabled={busy}
                      onClick={() =>
                        runAction(
                          () =>
                            api.createSubject({
                              name: subject.subject_name,
                              exam_date: subject.exam_date,
                              weightage: subject.weightage,
                              topics: subject.topics.map((topic) => ({
                                name: topic.topic_name,
                                difficulty: topic.difficulty,
                                confidence: topic.confidence,
                                est_hours: topic.estimated_hours,
                              })),
                            }),
                          `Saved ${subject.subject_name}.`,
                          () =>
                            setParsed((current) =>
                              current.filter(
                                (_, subjectIndex) => subjectIndex !== index,
                              ),
                            ),
                        )
                      }
                    >
                      Save subject <Check size={14} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">OR BUILD IT YOURSELF</span>
                <h2>Add a subject manually</h2>
              </div>
              <span className="soft-icon">
                <Plus size={19} />
              </span>
            </div>
            <form onSubmit={saveManual} className="manual-form">
              <div className="form-two">
                <label>
                  Subject name
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Computer Science"
                    required
                  />
                </label>
                <label>
                  Exam date
                  <input
                    type="date"
                    value={form.exam_date}
                    onChange={(event) =>
                      setForm({ ...form, exam_date: event.target.value })
                    }
                    required
                  />
                </label>
              </div>
              <label className="range-label">
                Importance <span>{form.weightage}/10</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={form.weightage}
                  onChange={(event) =>
                    setForm({ ...form, weightage: Number(event.target.value) })
                  }
                />
              </label>
              <div className="topic-form-head">
                <b>Topics</b>
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setForm({
                      ...form,
                      topics: [...form.topics, { ...EMPTY_TOPIC }],
                    })
                  }
                >
                  <Plus size={15} /> Add topic
                </button>
              </div>
              {form.topics.map((topic, index) => (
                <div className="topic-input-row" key={index}>
                  <input
                    aria-label="Topic name"
                    placeholder="Topic name"
                    value={topic.name}
                    onChange={(event) =>
                      updateTopic(index, "name", event.target.value)
                    }
                  />
                  <label>
                    Effort
                    <input
                      aria-label="Estimated hours"
                      type="number"
                      min="0.5"
                      max="40"
                      step="0.5"
                      value={topic.est_hours}
                      onChange={(event) =>
                        updateTopic(
                          index,
                          "est_hours",
                          Number(event.target.value),
                        )
                      }
                    />
                  </label>
                  <label>
                    Difficulty
                    <input
                      aria-label="Difficulty"
                      type="number"
                      min="1"
                      max="5"
                      value={topic.difficulty}
                      onChange={(event) =>
                        updateTopic(
                          index,
                          "difficulty",
                          Number(event.target.value),
                        )
                      }
                    />
                  </label>
                  <label>
                    Confidence
                    <input
                      aria-label="Confidence"
                      type="number"
                      min="1"
                      max="5"
                      value={topic.confidence}
                      onChange={(event) =>
                        updateTopic(
                          index,
                          "confidence",
                          Number(event.target.value),
                        )
                      }
                    />
                  </label>
                  {form.topics.length > 1 && (
                    <button
                      type="button"
                      className="icon-button danger-icon"
                      aria-label="Remove topic"
                      onClick={() =>
                        setForm({
                          ...form,
                          topics: form.topics.filter(
                            (_, topicIndex) => topicIndex !== index,
                          ),
                        })
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="button button-dark button-small"
                disabled={busy || !form.name || !form.exam_date}
              >
                Save subject <ArrowRight size={15} />
              </button>
            </form>
          </section>
        </div>
        <section className="subject-list-column">
          <div className="section-row">
            <div>
              <span className="panel-kicker">YOUR CURRENT LOAD</span>
              <h2>
                Subjects <span className="count-pill">{subjects.length}</span>
              </h2>
            </div>
          </div>
          {subjects.length ? (
            subjects.map((subject) => (
              <article className="subject-card" key={subject.id}>
                <div className="subject-card-top">
                  <span className="subject-monogram">
                    {subject.name.slice(0, 1)}
                  </span>
                  <button
                    className="icon-button danger-icon"
                    title={`Delete ${subject.name}`}
                    onClick={() =>
                      runAction(
                        () => api.deleteSubject(subject.id),
                        `Deleted ${subject.name}.`,
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <h3>{subject.name}</h3>
                <p>
                  <CalendarDays size={14} /> Exam {subject.exam_date}
                </p>
                <div className="subject-card-foot">
                  <span>{subject.topics.length} topics</span>
                  <span>Weight {subject.weightage}/10</span>
                </div>
                {subject.topics.length > 0 && (
                  <div className="subject-topics">
                    {subject.topics.slice(0, 3).map((topic) => (
                      <span key={topic.id}>{topic.name}</span>
                    ))}
                    {subject.topics.length > 3 && (
                      <small>+{subject.topics.length - 3} more</small>
                    )}
                  </div>
                )}
              </article>
            ))
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Nothing on the list yet"
              text="Add your first subject or load the sample set to explore the planner."
            />
          )}
        </section>
      </div>
    </>
  );
}

function AvailabilityPage({ availability, busy, runAction }) {
  const [days, setDays] = useState(
    WEEKDAYS.map((name, weekday) => {
      const slot = availability.find((item) => item.weekday === weekday);
      return {
        weekday,
        name,
        enabled: Boolean(slot),
        start: slot?.start || "18:00",
        end: slot?.end || "20:00",
      };
    }),
  );
  useEffect(() => {
    setDays(
      WEEKDAYS.map((name, weekday) => {
        const slot = availability.find((item) => item.weekday === weekday);
        return {
          weekday,
          name,
          enabled: Boolean(slot),
          start: slot?.start || "18:00",
          end: slot?.end || "20:00",
        };
      }),
    );
  }, [availability]);
  const enabledCount = days.filter((day) => day.enabled).length;
  async function save(event) {
    event.preventDefault();
    const slots = days
      .filter((day) => day.enabled)
      .map(({ weekday, start, end }) => ({ weekday, start, end }));
    await runAction(
      () => api.saveAvailability(slots),
      "Your weekly study hours have been saved.",
    );
  }
  return (
    <>
      <PageHeading
        kicker="MAKE SPACE FOR IT"
        title="Your availability"
        description="Choose the hours that really work for you. Your plan will stay inside these windows."
      />
      <div className="availability-layout">
        <section className="panel availability-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">WEEKLY STUDY WINDOWS</span>
              <h2>When are you at your best?</h2>
            </div>
            <span className="soft-icon">
              <Clock3 size={19} />
            </span>
          </div>
          <form onSubmit={save}>
            {days.map((day, index) => (
              <div
                className={`availability-row ${day.enabled ? "day-enabled" : ""}`}
                key={day.weekday}
              >
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(event) =>
                      setDays((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, enabled: event.target.checked }
                            : item,
                        ),
                      )
                    }
                  />
                  <span className="toggle-ui" />
                  <b>{day.name}</b>
                </label>
                {day.enabled ? (
                  <div className="time-selects">
                    <select
                      aria-label={`${day.name} start`}
                      value={day.start}
                      onChange={(event) =>
                        setDays((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, start: event.target.value }
                              : item,
                          ),
                        )
                      }
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time}>{time}</option>
                      ))}
                    </select>
                    <span>to</span>
                    <select
                      aria-label={`${day.name} end`}
                      value={day.end}
                      onChange={(event) =>
                        setDays((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, end: event.target.value }
                              : item,
                          ),
                        )
                      }
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="day-off">Day off</span>
                )}
              </div>
            ))}
            <div className="form-footer">
              <span className="quiet-note">
                {enabledCount} days available · adjust any time
              </span>
              <button
                className="button button-dark button-small"
                disabled={busy}
              >
                Save availability <Check size={15} />
              </button>
            </div>
          </form>
        </section>
        <aside className="panel availability-aside">
          <span className="soft-icon lime">
            <Sparkles size={19} />
          </span>
          <h3>Protect your off-hours.</h3>
          <p>
            Your plan only uses the windows you set here. Leave room for meals,
            rest, and everything else that matters.
          </p>
          <div className="aside-stat">
            <b>{enabledCount}</b>
            <span>study days each week</span>
          </div>
        </aside>
      </div>
    </>
  );
}

function PlanPage({ sessions, busy, planDetails, setPlanDetails, runAction }) {
  const today = toDateKey(new Date());
  const [startDate, setStartDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [prompt, setPrompt] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("calendar");
  const filteredSessions = sessions.filter(
    (session) => filter === "all" || session.kind === filter,
  );
  async function generate() {
    await runAction(
      () => api.generatePlan(startDate, prompt),
      (result) => `Built a plan with ${result.sessions.length} sessions.`,
      (result) => {
        setPlanDetails(result);
        setSelectedDate(startDate);
      },
    );
  }
  async function replan() {
    await runAction(
      () => api.replan(),
      (result) => result.explanation || "Your plan has been updated.",
      (result) =>
        setPlanDetails({ ...result, rationale: result.explanation, tips: [] }),
    );
  }
  return (
    <>
      <PageHeading
        kicker="ONE THING, THEN THE NEXT"
        title="Your study plan"
        description="A practical day-by-day schedule, with space to revisit what you learn."
        action={
          <a className="button button-outline" href={api.exportUrl}>
            <Download size={16} /> Export .ics
          </a>
        }
      />
      <section className="panel plan-controls">
        <div>
          <span className="panel-kicker">BUILD YOUR SCHEDULE</span>
          <h2>Start with today, or choose a date.</h2>
        </div>
        <label className="plan-start-field">
          Plan starts
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
      </section>
      <section className="panel plan-prompt-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">MAKE IT YOURS</span>
            <h2>What should this plan work around?</h2>
          </div>
          <span className="soft-icon lime">
            <Sparkles size={19} />
          </span>
        </div>
        <p className="panel-description">
          Describe the exam, deadline, study hours, and timing you want. For
          example: “GATE exam in Feb 2027, 4 hours per day.” Exam prompts use
          matching subjects and topics saved under Goals &amp; subjects.
        </p>
        <label className="field-label" htmlFor="planPrompt">
          Plan prompt
          <textarea
            id="planPrompt"
            rows="3"
            placeholder="e.g. GATE exam in Feb 2027, prepare 4 hours per day, weekdays only."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
        </label>
        <div className="prompt-supported">
          <span>Understands</span>
          <b>exam focus</b>
          <i>·</i>
          <b>days to avoid</b>
          <i>·</i>
          <b>morning / afternoon / evening</b>
          <i>·</i>
          <b>subject priorities</b>
        </div>
        <div className="form-footer plan-prompt-footer">
          <span className="quiet-note">Your prompt, exam dates, saved topics, and availability shape the schedule.</span>
          <button
            className="button button-dark"
            type="button"
            disabled={busy || !startDate}
            onClick={generate}
          >
            {busy ? "Building your schedule…" : "Generate schedule from prompt"}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
      {planDetails?.prompt_notes?.length > 0 && (
        <section className="prompt-result">
          <CheckCircle2 size={16} />
          <div>
            <b>Prompt applied to this schedule</b>
            <ul>
              {planDetails.prompt_notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {planDetails?.feasibility && (
        <section
          className={`feasibility-banner ${planDetails.feasibility.is_feasible ? "feasible" : "overload"}`}
        >
          <span className="feasibility-icon">
            {planDetails.feasibility.is_feasible ? (
              <CheckCircle2 />
            ) : (
              <CircleHelp />
            )}
          </span>
          <div>
            <b>
              {planDetails.feasibility.is_feasible
                ? "This workload fits your available time."
                : "Your workload needs a little adjustment."}
            </b>
            <p>
              {planDetails.feasibility.total_required_hours} hours estimated ·{" "}
              {planDetails.feasibility.total_available_hours} hours available
              {!planDetails.feasibility.is_feasible &&
                ` · ${planDetails.feasibility.shortfall_hours} hours over capacity`}
            </p>
            {!planDetails.feasibility.is_feasible &&
              planDetails.feasibility.suggestions.map((suggestion) => (
                <small key={suggestion}>{suggestion}</small>
              ))}
          </div>
        </section>
      )}
      {planDetails?.rationale && (
        <section className="panel rationale-panel">
          <span className="soft-icon lime">
            <Sparkles size={18} />
          </span>
          <div>
            <span className="panel-kicker">PLANNER NOTES</span>
            <p>{planDetails.rationale}</p>
            {planDetails.tips?.length > 0 && (
              <div className="tip-chips">
                {planDetails.tips.map((tip) => (
                  <span key={tip}>{tip}</span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <div className="section-row plan-list-heading">
        <div>
          <span className="panel-kicker">YOUR SCHEDULE</span>
          <h2>{sessions.length} sessions planned</h2>
        </div>
        <div className="plan-list-actions">
          <div className="view-toggle" role="group" aria-label="Schedule view">
            <button
              className={view === "calendar" ? "selected" : ""}
              onClick={() => setView("calendar")}
            >
              <CalendarDays size={14} /> Calendar
            </button>
            <button
              className={view === "list" ? "selected" : ""}
              onClick={() => setView("list")}
            >
              <ListChecks size={14} /> List
            </button>
          </div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter session type"
          >
            <option value="all">All sessions</option>
            <option value="study">Study</option>
            <option value="revision">Revision</option>
          </select>
          <button
            className="button button-outline button-small"
            disabled={busy || !sessions.length}
            onClick={replan}
          >
            <RefreshCw size={14} /> Re-plan missed work
          </button>
        </div>
      </div>
      {view === "calendar" ? (
        <MonthCalendar
          sessions={filteredSessions}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      ) : filteredSessions.length ? (
        <div className="session-list">
          {filteredSessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Your plan is waiting"
          text={
            sessions.length
              ? "No sessions match this filter."
              : "Add subjects and set weekly availability, then generate your schedule."
          }
        />
      )}
    </>
  );
}

function TodayPage({ sessions, tasks, busy, runAction, today }) {
  const [minutes, setMinutes] = useState({});
  const [selectedDate, setSelectedDate] = useState(today);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const daySessions = sessions.filter((session) => session.date === selectedDate);
  const dayTasks = tasks.filter((task) => task.task_date === selectedDate);
  const completedTasks = dayTasks.filter((task) => task.status === "completed").length;

  async function addTask(event) {
    event.preventDefault();
    const created = await runAction(
      () => api.createDailyTask({
        title: taskTitle,
        task_date: selectedDate,
        start: taskTime || null,
        note: taskNote || null,
      }),
      `Added “${taskTitle}” to your day.`,
    );
    if (created) {
      setTaskTitle("");
      setTaskTime("");
      setTaskNote("");
    }
  }

  return (
    <>
      <PageHeading
        kicker={new Intl.DateTimeFormat("en", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(new Date(`${selectedDate}T12:00:00`))
          .toUpperCase()}
        title="Today, in focus."
        description="Add the little things you need to do, then check them off as you go."
        action={
          <label className="today-date-control">
            <CalendarDays size={16} />
            <span>Day</span>
            <input
              type="date"
              aria-label="Choose day"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
        }
      />
      <div className="today-summary">
        <span className="today-summary-icon">
          <ListChecks size={19} />
        </span>
        <div>
          <b>{dayTasks.length + daySessions.length} things on your list</b>
          <p>{completedTasks} of {dayTasks.length} personal tasks done · {daySessions.filter((session) => session.status === "completed").length} study sessions complete</p>
        </div>
      </div>

      <section className="panel daily-task-composer">
        <div className="daily-task-composer-heading">
          <span className="daily-task-plus"><Plus size={18} /></span>
          <div><span className="panel-kicker">A TASK ON YOUR MIND?</span><h2>Add it to the day.</h2></div>
        </div>
        <form className="daily-task-form" onSubmit={addTask}>
          <label className="daily-task-title-field">Task<input autoComplete="off" maxLength={160} placeholder="e.g. Review lecture notes" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} required /></label>
          <label className="daily-task-time-field">Time <span>optional</span><input type="time" value={taskTime} onChange={(event) => setTaskTime(event.target.value)} /></label>
          <label className="daily-task-note-field">Note <span>optional</span><input maxLength={1000} placeholder="Add a little detail" value={taskNote} onChange={(event) => setTaskNote(event.target.value)} /></label>
          <button className="button button-dark button-small" disabled={busy || !taskTitle.trim()}><Plus size={15} /> Add task</button>
        </form>
      </section>

      <div className="section-row today-task-section-heading">
        <div><span className="panel-kicker">YOUR PERSONAL TASKS</span><h2>{dayTasks.length ? `${dayTasks.length} tasks for this day` : "Make today yours"}</h2></div>
        {dayTasks.length > 0 && <span className="count-pill">{completedTasks} done</span>}
      </div>
      {dayTasks.length ? (
        <div className="daily-task-list">
          {dayTasks.map((task) => (
            <article className={`daily-task-row task-${task.status}`} key={task.id}>
              <span className="daily-task-state">{task.status === "completed" ? <Check size={17} /> : task.status === "missed" ? <X size={17} /> : <ListChecks size={17} />}</span>
              <div className="daily-task-main"><div className="daily-task-title-line"><h3>{task.title}</h3><span className={`task-status-tag ${task.status}`}>{task.status === "completed" ? "Done" : task.status === "missed" ? "Missed" : "To do"}</span></div><p>{task.start ? <><Clock3 size={13} /> {task.start} <span>·</span> </> : null}{task.note || "Personal task"}</p></div>
              <div className="daily-task-actions">
                {task.status !== "completed" && <button className="task-done-button" disabled={busy} onClick={() => runAction(() => api.updateDailyTask(task.id, "completed"), `Marked “${task.title}” done.`)}><Check size={14} /> Done</button>}
                {task.status !== "missed" && <button className="task-missed-button" disabled={busy} onClick={() => runAction(() => api.updateDailyTask(task.id, "missed"), `Marked “${task.title}” missed.`)}>Missed</button>}
                {task.status !== "pending" && <button className="task-restore-button" disabled={busy} onClick={() => runAction(() => api.updateDailyTask(task.id, "pending"), `Moved “${task.title}” back to your list.`)}>Undo</button>}
                <button className="icon-button danger-icon" aria-label={`Delete ${task.title}`} disabled={busy} onClick={() => runAction(() => api.deleteDailyTask(task.id), `Deleted “${task.title}”.`)}><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={CheckCircle2} title="Nothing extra on this day" text="Add a personal task above. It stays separate from your generated study sessions." />
      )}

      <div className="section-row today-study-section-heading">
        <div><span className="panel-kicker">STUDY PLAN</span><h2>{daySessions.length ? `${daySessions.length} scheduled sessions` : "No study sessions scheduled"}</h2></div>
      </div>
      {daySessions.length ? (
        <div className="today-session-list">
          {daySessions.map((session) => (
            <article
              className={`today-card status-card-${session.status}`}
              key={session.id}
            >
              <div className="today-card-time">
                <b>{session.start}</b>
                <span>{session.end}</span>
                <i />
              </div>
              <div className="today-card-content">
                <div className="today-card-tags">
                  <span
                    className={
                      session.kind === "revision" ? "tag-revision" : ""
                    }
                  >
                    {session.kind}
                  </span>
                  <span>{session.status}</span>
                </div>
                <h2>{session.topic_name}</h2>
                <p>{session.subject_name}</p>
                {session.status === "pending" && (
                  <div className="today-card-actions">
                    <label>
                      Minutes studied
                      <input
                        type="number"
                        min="1"
                        max="600"
                        value={minutes[session.id] || 60}
                        onChange={(event) =>
                          setMinutes({
                            ...minutes,
                            [session.id]: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <button
                      className="button button-dark button-small"
                      disabled={busy}
                      onClick={() =>
                        runAction(
                          () =>
                            api.updateSession(
                              session.id,
                              "completed",
                              minutes[session.id] || 60,
                            ),
                          `Logged ${session.topic_name} as complete.`,
                        )
                      }
                    >
                      <Check size={15} /> Done
                    </button>
                    <button
                      className="button button-quiet button-small"
                      disabled={busy}
                      onClick={() =>
                        runAction(
                          () => api.updateSession(session.id, "missed"),
                          `${session.topic_name} marked for re-planning.`,
                        )
                      }
                    >
                      Missed
                    </button>
                  </div>
                )}
                {session.status === "completed" && (
                  <span className="completed-label">
                    <CheckCircle2 size={15} /> Session complete
                  </span>
                )}
              </div>
              <div className={`today-status-mark mark-${session.status}`}>
                {session.status === "completed" ? (
                  <Check size={17} />
                ) : session.status === "missed" ? (
                  <X size={17} />
                ) : (
                  <Clock3 size={17} />
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No study sessions on this day"
          text="Your personal tasks still work here, or generate a study plan to schedule sessions."
        />
      )}
    </>
  );
}

function ProgressPage({ sessions, subjects, completedCount }) {
  const missed = sessions.filter(
    (session) => session.status === "missed",
  ).length;
  const pending = sessions.filter(
    (session) => session.status === "pending",
  ).length;
  const completion = sessions.length
    ? Math.round((completedCount / sessions.length) * 100)
    : 0;
  return (
    <>
      <PageHeading
        kicker="NOTICE HOW FAR YOU’VE COME"
        title="Progress, not perfection."
        description="Every session you show up for counts. Here’s where you are today."
      />
      <div className="progress-top-grid">
        <section className="panel progress-score">
          <div
            className="progress-ring"
            style={{ "--progress": `${completion}%` }}
          >
            <div>
              <b>{completion}%</b>
              <span>complete</span>
            </div>
          </div>
          <div>
            <span className="panel-kicker">YOUR OVERALL PACE</span>
            <h2>
              {completion >= 70
                ? "Look at you go."
                : completion > 0
                  ? "You’re building a rhythm."
                  : "Your first step is waiting."}
            </h2>
            <p>
              {completedCount} of {sessions.length} planned sessions complete.
            </p>
          </div>
        </section>
        <div className="progress-stats">
          <div className="panel">
            <span className="stat-icon completed">
              <Check size={17} />
            </span>
            <b>{completedCount}</b>
            <small>Completed</small>
          </div>
          <div className="panel">
            <span className="stat-icon pending">
              <Clock3 size={17} />
            </span>
            <b>{pending}</b>
            <small>Still ahead</small>
          </div>
          <div className="panel">
            <span className="stat-icon missed">
              <RefreshCw size={17} />
            </span>
            <b>{missed}</b>
            <small>To re-plan</small>
          </div>
        </div>
      </div>
      <div className="section-row">
        <div>
          <span className="panel-kicker">BY SUBJECT</span>
          <h2>Where the work is going</h2>
        </div>
      </div>
      {subjects.length ? (
        <div className="progress-subject-list">
          {subjects.map((subject) => {
            const subjectSessions = sessions.filter(
              (session) => session.subject_name === subject.name,
            );
            const done = subjectSessions.filter(
              (session) => session.status === "completed",
            ).length;
            const percent = subjectSessions.length
              ? Math.round((done / subjectSessions.length) * 100)
              : 0;
            return (
              <article key={subject.id}>
                <div className="progress-subject-heading">
                  <span className="subject-monogram">
                    {subject.name.slice(0, 1)}
                  </span>
                  <div>
                    <b>{subject.name}</b>
                    <small>
                      {done} of {subjectSessions.length} sessions complete
                    </small>
                  </div>
                  <strong>{percent}%</strong>
                </div>
                <div className="momentum-track">
                  <i style={{ width: `${percent}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Your progress starts with a plan"
          text="Add a subject to start tracking your work."
        />
      )}
    </>
  );
}

export default App;
