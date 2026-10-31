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
  LayoutDashboard,
  BookOpen,
  Clock3,
  CalendarDays,
  ListChecks,
  TrendingUp,
  RefreshCw,
  Search,
  Timer,
  Moon,
  Sun,
  Menu,
  X,
  Flame,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { getInitialTheme, applyTheme } from "../utils/theme.js";
import { getCurrentUser, logoutUser, updateUserProfile } from "../utils/auth.js";

import Brand from "../components/Brand.jsx";
import PomodoroTimer from "../components/PomodoroTimer.jsx";
import CommandPalette from "../components/CommandPalette.jsx";
import ProfileModal from "../components/ProfileModal.jsx";

import LandingPage from "./LandingPage.jsx";
import LoginPage from "./LoginPage.jsx";
import OverviewPage from "./OverviewPage.jsx";
import SubjectsPage from "./SubjectsPage.jsx";
import AvailabilityPage from "./AvailabilityPage.jsx";
import PlanPage from "./PlanPage.jsx";
import TodayPage from "./TodayPage.jsx";
import ProgressPage from "./ProgressPage.jsx";

const NAV_ITEMS = [
  { id: "Overview", slug: "overview", icon: LayoutDashboard },
  { id: "Today", slug: "today", icon: ListChecks },
  { id: "Study plan", slug: "plan", icon: CalendarDays },
  { id: "Goals & subjects", slug: "subjects", icon: BookOpen },
  { id: "Availability", slug: "availability", icon: Clock3 },
  { id: "Progress", slug: "progress", icon: TrendingUp },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("daymark-current-user");
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  });

  function handleLogin(user) {
    setCurrentUser(user);
  }

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage currentUser={currentUser} />} />
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/workspace/overview" replace />
          ) : (
            <LoginPage onLoginSuccess={handleLogin} />
          )
        }
      />
      <Route
        path="/workspace/*"
        element={
          currentUser ? (
            <WorkspaceShell
              profile={currentUser}
              onUpdateProfile={setCurrentUser}
              onLogout={handleLogout}
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

function WorkspaceShell({ profile, onUpdateProfile, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [theme, setTheme] = useState(getInitialTheme);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // App Data
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [health, setHealth] = useState(true);
  const [busy, setBusy] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);

  // Modals & Widgets State
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeTimerSession, setActiveTimerSession] = useState(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Active page resolution
  const pathParts = location.pathname.split("/").filter(Boolean);
  const activeSlug = pathParts[1] || "overview";
  const activeNav = NAV_ITEMS.find((item) => item.slug === activeSlug) || NAV_ITEMS[0];

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    showToast({
      type: "info",
      title: `${next === "dark" ? "Dark" : "Light"} Mode Enabled`,
    });
  }

  function handleSaveProfile(newProfile) {
    const updated = updateUserProfile(newProfile);
    onUpdateProfile(updated);
    showToast({
      type: "success",
      title: "Profile Updated",
      message: "Your preferences and avatar have been saved.",
    });
  }



  function handleSidebarToggle() {
    // If mobile viewport (width < 768px), toggle drawer
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      // Desktop: collapse / expand sidebar
      setSidebarCollapsed(!sidebarCollapsed);
    }
  }

  async function refreshData(quiet = false) {
    try {
      const [subjectData, sessionData, availabilityData, healthData, taskData] =
        await Promise.all([
          api.subjects(),
          api.plan(),
          api.availability(),
          api.health(),
          api.dailyTasks(),
        ]);
      setSubjects(subjectData || []);
      setSessions(sessionData || []);
      setAvailability(availabilityData || []);
      setDailyTasks(taskData || []);
      setHealth(healthData?.status === "online");
      if (!quiet) {
        showToast({
          type: "info",
          title: "Data Synced",
          message: "All study schedules and tasks are up to date.",
          duration: 2200,
        });
      }
    } catch (err) {
      setHealth(false);
      showToast({
        type: "error",
        title: "Connection Error",
        message: err.message || "Could not reach FastAPI backend.",
      });
    }
  }

  useEffect(() => {
    refreshData(true);
  }, []);

  async function runAction(action, successMessage, after) {
    setBusy(true);
    try {
      const result = await action();
      if (after) after(result);
      await refreshData(true);
      if (successMessage) {
        const msg = typeof successMessage === "function" ? successMessage(result) : successMessage;
        showToast({
          type: "success",
          title: "Success",
          message: msg,
        });
      }
      return result;
    } catch (actionError) {
      showToast({
        type: "error",
        title: "Action Failed",
        message: actionError.message || "An unexpected error occurred.",
      });
      return null;
    } finally {
      setBusy(false);
    }
  }

  function handleStartTimer(session = null) {
    setActiveTimerSession(session);
    setIsTimerOpen(true);
  }

  function handleSessionComplete(sessionId, minutes) {
    runAction(
      () => api.updateSession(sessionId, "completed", minutes),
      `Completed session and logged ${minutes} minutes of deep focus!`
    );
  }

  function selectPage(pageId) {
    const item = NAV_ITEMS.find((n) => n.id === pageId);
    if (item) {
      navigate(`/workspace/${item.slug}`);
      setMobileDrawerOpen(false);
    }
  }

  function handleUserSignOut() {
    showToast({
      type: "info",
      title: "Signed Out",
      message: "You have been logged out of your study workspace.",
    });
    onLogout();
    navigate("/login");
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayTasks = dailyTasks.filter((t) => t.task_date === todayStr);
  const completedCount = sessions.filter((s) => s.status === "completed").length;

  return (
    <div className="workspace-shell">
      {/* Sidebar Navigation */}
      <aside
        className={`workspace-sidebar ${mobileDrawerOpen ? "mobile-open" : ""} ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="workspace-brand-row">
          <Link to="/" className="workspace-brand">
            <Brand size={sidebarCollapsed ? "normal" : "large"} />
          </Link>
          {/* Close button for mobile drawer */}
          <button
            className="icon-button mobile-close-btn"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">Study Workspace</div>

        <nav className="workspace-nav" aria-label="Planner navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav.id === item.id;
            return (
              <button
                key={item.id}
                className={`workspace-nav-item ${isActive ? "active" : ""}`}
                onClick={() => selectPage(item.id)}
                title={sidebarCollapsed ? item.id : undefined}
              >
                <Icon size={18} />
                <span>{item.id}</span>
                {item.id === "Today" && todaySessions.length + todayTasks.length > 0 && (
                  <i>{todaySessions.length + todayTasks.length}</i>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom: Streak, Profile & Sign Out */}
        <div className="sidebar-bottom">
          {!sidebarCollapsed && (
            <div className="sidebar-streak-card">
              <span className="streak-flame">🔥</span>
              <div className="streak-info">
                <b>3-Day Focus Streak</b>
                <small>Consistency builds recall</small>
              </div>
            </div>
          )}

          <div
            className="profile-row"
            onClick={() => setIsProfileOpen(true)}
            title="Open Student Profile Settings"
          >
            <div
              className="profile-avatar"
              style={{ backgroundColor: profile.avatarColor || "#6366f1" }}
            >
              {profile.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-meta">
              <b>{profile.name}</b>
              <small>{profile.goal || profile.email}</small>
            </div>
            <Settings size={15} style={{ color: "var(--text-muted)" }} />
          </div>

          {/* Explicit Sign Out Button */}
          <button
            type="button"
            className="workspace-logout-btn"
            onClick={handleUserSignOut}
            title="Sign out of this account"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Dedicated Mobile Scrim (Clean dark overlay, NO BLUR) */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-scrim"
          onClick={() => setMobileDrawerOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Main Content Area */}
      <main className="workspace-main">
        {/* Sticky Topbar */}
        <header className="workspace-topbar">
          <div className="topbar-left">
            <button
              className="icon-button sidebar-toggle-btn"
              onClick={handleSidebarToggle}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle navigation"
            >
              <Menu size={18} />
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-prefix">Workspace / </span>
              <b>{activeNav.id}</b>
            </div>
          </div>

          {/* Quick Command Trigger */}
          <button
            className="command-trigger-btn"
            onClick={() => setIsCommandOpen(true)}
            title="Open Command Palette (Cmd+K)"
          >
            <Search size={14} />
            <span className="cmd-text">Search topics or jump to...</span>
            <kbd className="cmd-kbd">⌘K</kbd>
          </button>

          <div className="topbar-right">
            {/* Quick Timer Trigger */}
            <button
              className="button button-outline button-small topbar-timer-btn"
              onClick={() => handleStartTimer()}
              title="Launch Pomodoro Timer"
            >
              <Timer size={14} />
              <span className="timer-btn-text">Focus Timer</span>
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              className="icon-button"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Refresh */}
            <button
              className="icon-button"
              onClick={() => refreshData()}
              title="Refresh planner data"
            >
              <RefreshCw size={17} className={busy ? "spin" : ""} />
            </button>

            {/* Profile Avatar Trigger */}
            <button
              className="icon-button"
              onClick={() => setIsProfileOpen(true)}
              title={`Signed in as ${profile.name} (${profile.email}) - Open Settings`}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: profile.avatarColor || "#6366f1",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {profile.name.slice(0, 1).toUpperCase()}
              </div>
            </button>

            {/* Quick Sign Out from Topbar */}
            <button
              className="icon-button danger-icon topbar-signout-btn"
              onClick={handleUserSignOut}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>

            {/* API Status Pill */}
            <span className={`api-status ${health ? "is-online" : ""}`}>
              <i />
              <span className="api-status-text">{health ? "Live Engine" : "Offline"}</span>
            </span>
          </div>
        </header>

        {/* Page Content View */}
        <div className="workspace-content">
          {activeNav.id === "Overview" && (
            <OverviewPage
              profile={profile}
              subjects={subjects}
              sessions={sessions}
              todaySessions={todaySessions}
              completedCount={completedCount}
              onNavigate={selectPage}
              onStartTimer={handleStartTimer}
              onUpdateSession={(id, status, mins) =>
                runAction(
                  () => api.updateSession(id, status, mins),
                  "Session updated successfully!"
                )
              }
            />
          )}

          {activeNav.id === "Today" && (
            <TodayPage
              sessions={sessions}
              tasks={dailyTasks}
              busy={busy}
              runAction={runAction}
              api={api}
              today={todayStr}
              onStartTimer={handleStartTimer}
            />
          )}

          {activeNav.id === "Study plan" && (
            <PlanPage
              sessions={sessions}
              busy={busy}
              planDetails={planDetails}
              setPlanDetails={setPlanDetails}
              runAction={runAction}
              api={api}
              onStartTimer={handleStartTimer}
            />
          )}

          {activeNav.id === "Goals & subjects" && (
            <SubjectsPage
              subjects={subjects}
              busy={busy}
              runAction={runAction}
              api={api}
            />
          )}

          {activeNav.id === "Availability" && (
            <AvailabilityPage
              availability={availability}
              busy={busy}
              runAction={runAction}
              api={api}
            />
          )}

          {activeNav.id === "Progress" && (
            <ProgressPage
              sessions={sessions}
              subjects={subjects}
              completedCount={completedCount}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar for phone viewports */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav.id === item.id;
          const shortLabel =
            item.id === "Study plan"
              ? "Plan"
              : item.id === "Goals & subjects"
              ? "Subjects"
              : item.id === "Availability"
              ? "Hours"
              : item.id;
          return (
            <button
              key={item.id}
              className={`mobile-nav-btn ${isActive ? "active" : ""}`}
              onClick={() => selectPage(item.id)}
              title={item.id}
            >
              <Icon size={18} />
              <span>{shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Pomodoro Timer Widget & Modal */}
      <PomodoroTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        activeSession={activeTimerSession}
        onSessionComplete={handleSessionComplete}
      />

      {/* Global Cmd+K Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={selectPage}
        onStartTimer={handleStartTimer}
        onToggleTheme={toggleTheme}
        theme={theme}
        subjects={subjects}
        onExportCalendar={() => {
          window.location.href = api.exportUrl;
        }}
        onReplan={() => {
          selectPage("Study plan");
        }}
      />

      {/* Student Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onLogout={handleUserSignOut}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoadSampleData={() =>
          runAction(
            () => api.addSamples(),
            "Sample subjects and study curriculum loaded!"
          )
        }
        busy={busy}
      />
    </div>
  );
}
