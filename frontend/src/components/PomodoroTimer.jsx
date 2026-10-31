import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, X, Minimize2, Maximize2, Bell, Check, Sparkles, Volume2, VolumeX } from "lucide-react";
import { sounds } from "../utils/audio";

const PRESETS = [
  { label: "Focus 25m", minutes: 25, type: "focus" },
  { label: "Deep 50m", minutes: 50, type: "focus" },
  { label: "Break 5m", minutes: 5, type: "break" },
  { label: "Break 15m", minutes: 15, type: "break" },
];

export default function PomodoroTimer({
  isOpen,
  onClose,
  activeSession,
  onSessionComplete,
}) {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState("focus"); // focus or break
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  const totalSeconds = minutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // When activeSession is passed in or changes, reset timer
  useEffect(() => {
    if (activeSession) {
      setIsMinimized(false);
      // If session has time, default to 25m
      setMinutes(25);
      setSecondsLeft(25 * 60);
      setIsRunning(false);
    }
  }, [activeSession]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            sounds.playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  function handleStartPause() {
    if (!isRunning) {
      sounds.playStart();
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(minutes * 60);
  }

  function selectPreset(preset) {
    setIsRunning(false);
    setMinutes(preset.minutes);
    setSecondsLeft(preset.minutes * 60);
    setMode(preset.type);
  }

  const displayMinutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const displaySeconds = String(secondsLeft % 60).padStart(2, "0");

  if (!isOpen) return null;

  // Render minimized floating pill
  if (isMinimized) {
    return (
      <div className="pomodoro-pill" onClick={() => setIsMinimized(false)}>
        <div className={`pomodoro-pill-dot ${isRunning ? "pulse" : ""}`} />
        <span className="pomodoro-pill-time">
          {displayMinutes}:{displaySeconds}
        </span>
        {activeSession && (
          <span className="pomodoro-pill-topic">
            {activeSession.topic_name || activeSession.topic}
          </span>
        )}
        <button
          className="pomodoro-pill-action"
          onClick={(e) => {
            e.stopPropagation();
            handleStartPause();
          }}
          title={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button
          className="pomodoro-pill-action"
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
          }}
          title="Expand"
        >
          <Maximize2 size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="pomodoro-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="pomodoro-modal-header">
          <div className="pomodoro-badge">
            <Sparkles size={14} />
            <span>Deep Work Focus</span>
          </div>
          <div className="pomodoro-header-actions">
            <button
              className="icon-button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              className="icon-button"
              onClick={() => setIsMinimized(true)}
              title="Minimize to floating pill"
            >
              <Minimize2 size={16} />
            </button>
            <button className="icon-button" onClick={onClose} title="Close timer">
              <X size={16} />
            </button>
          </div>
        </div>

        {activeSession && (
          <div className="pomodoro-active-banner">
            <span className="banner-kicker">CURRENT FOCUS TOPIC</span>
            <h4>{activeSession.topic_name || activeSession.topic}</h4>
            <small>{activeSession.subject_name || activeSession.subject}</small>
          </div>
        )}

        {/* Preset Selector */}
        <div className="pomodoro-presets">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className={`preset-btn ${minutes === p.minutes && mode === p.type ? "active" : ""}`}
              onClick={() => selectPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Circular Display */}
        <div className="pomodoro-dial-wrap">
          <svg className="pomodoro-dial" viewBox="0 0 100 100">
            <circle
              className="dial-track"
              cx="50"
              cy="50"
              r="44"
              strokeWidth="6"
              fill="none"
            />
            <circle
              className="dial-progress"
              cx="50"
              cy="50"
              r="44"
              strokeWidth="6"
              fill="none"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progressPercent / 100)}
            />
          </svg>
          <div className="pomodoro-display">
            <span className="pomodoro-time">
              {displayMinutes}:{displaySeconds}
            </span>
            <span className="pomodoro-mode-label">
              {mode === "focus" ? "Stay focused" : "Take a deep breath"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="pomodoro-controls">
          <button className="icon-button secondary" onClick={handleReset} title="Reset">
            <RotateCcw size={18} />
          </button>
          <button
            className={`button pomodoro-main-btn ${isRunning ? "button-pause" : "button-play"}`}
            onClick={handleStartPause}
          >
            {isRunning ? (
              <>
                <Pause size={18} /> Pause Focus
              </>
            ) : (
              <>
                <Play size={18} /> Start Focus
              </>
            )}
          </button>
          {activeSession && onSessionComplete && (
            <button
              className="button button-success"
              onClick={() => {
                const studied = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
                onSessionComplete(activeSession.id, studied);
                onClose();
              }}
              title="Mark session as completed and log time"
            >
              <Check size={16} /> Log Done
            </button>
          )}
        </div>

        <div className="pomodoro-footer-note">
          <span>Tip: Press Space to pause or resume. Keep this tab open.</span>
        </div>
      </div>
    </div>
  );
}
