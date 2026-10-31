import React, { useState } from "react";
import {
  User,
  X,
  Sparkles,
  Check,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onLogout,
  theme,
  onToggleTheme,
  onLoadSampleData,
  busy,
}) {
  const [name, setName] = useState(profile?.name || "Student");
  const [goal, setGoal] = useState(profile?.goal || "Upcoming Semester Exams");
  const [targetHours, setTargetHours] = useState(profile?.targetHours || 3);
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor || "#6366f1");

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const updated = {
      ...profile,
      name: name.trim() || "Student",
      goal: goal.trim() || "Exams",
      targetHours: Number(targetHours) || 3,
      avatarColor,
    };
    onSaveProfile(updated);
    onClose();
  }

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="profile-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="profile-modal-header">
          <div className="profile-badge">
            <User size={16} />
            <span>Student Profile & Workspace Settings</span>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-modal-body">
          {/* Active Account Identity Card */}
          <div className="profile-avatar-customizer">
            <div
              className="profile-preview-avatar"
              style={{ backgroundColor: avatarColor }}
            >
              {name.slice(0, 1).toUpperCase()}
            </div>
            <div className="avatar-color-options">
              <span className="field-hint">
                Signed in as <b>{profile?.email || "Student Account"}</b>
              </span>
              <div className="color-swatches">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`swatch ${avatarColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setAvatarColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <label className="field-group">
            <span>Your Name / Preferred Title</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luven Sharma"
              required
            />
          </label>

          <label className="field-group">
            <span>Main Goal or Exam Target</span>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. GATE 2027, USMLE, Finals Week"
            />
          </label>

          <label className="field-group">
            <span>Daily Focus Target: <b>{targetHours} hours/day</b></span>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
            />
          </label>

          <div className="profile-quick-actions">
            <div className="quick-action-item">
              <div>
                <b>Interface Theme</b>
                <small>Currently in {theme === "dark" ? "Dark Mode" : "Light Mode"}</small>
              </div>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={onToggleTheme}
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                <span>{theme === "dark" ? "Light" : "Dark"}</span>
              </button>
            </div>

            {onLoadSampleData && (
              <div className="quick-action-item">
                <div>
                  <b>Demo Sample Data</b>
                  <small>Populate database with sample subjects & schedule</small>
                </div>
                <button
                  type="button"
                  className="button button-outline button-small"
                  disabled={busy}
                  onClick={onLoadSampleData}
                >
                  <Sparkles size={14} />
                  <span>Load Samples</span>
                </button>
              </div>
            )}
          </div>

          <div className="profile-modal-footer">
            <button
              type="button"
              className="button button-quiet button-small danger-text"
              onClick={() => {
                onLogout();
                onClose();
              }}
              title="Sign out of your account"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary button-small">
                <Check size={15} /> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
