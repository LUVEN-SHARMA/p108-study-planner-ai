import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  BookOpen,
  Clock3,
  TrendingUp,
  Sparkles,
  Download,
  Moon,
  Sun,
  Timer,
  ArrowRight,
  X,
} from "lucide-react";

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onStartTimer,
  onToggleTheme,
  theme,
  subjects = [],
  onExportCalendar,
  onReplan,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global shortcut to open with Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or event
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Define commands
  const defaultCommands = [
    {
      id: "nav-today",
      category: "Navigation",
      title: "Today",
      icon: ListChecks,
      action: () => onNavigate("Today"),
    },
    {
      id: "nav-plan",
      category: "Navigation",
      title: "Study Plan",
      icon: CalendarDays,
      action: () => onNavigate("Study plan"),
    },
    {
      id: "nav-overview",
      category: "Navigation",
      title: "Overview",
      icon: LayoutDashboard,
      action: () => onNavigate("Overview"),
    },
    {
      id: "nav-subjects",
      category: "Navigation",
      title: "Goals & Subjects",
      icon: BookOpen,
      action: () => onNavigate("Goals & subjects"),
    },
    {
      id: "nav-availability",
      category: "Navigation",
      title: "Availability",
      icon: Clock3,
      action: () => onNavigate("Availability"),
    },
    {
      id: "nav-progress",
      category: "Navigation",
      title: "Progress",
      icon: TrendingUp,
      action: () => onNavigate("Progress"),
    },
    {
      id: "action-timer",
      category: "Actions",
      title: "Start Focus Timer (25m)",
      icon: Timer,
      action: () => onStartTimer(),
    },
    {
      id: "action-theme",
      category: "Preferences",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      icon: theme === "dark" ? Sun : Moon,
      action: () => onToggleTheme(),
    },
    {
      id: "action-export",
      category: "Actions",
      title: "Export Calendar (.ics)",
      icon: Download,
      action: () => onExportCalendar(),
    },
  ];

  // Subject and topic search results
  const subjectCommands = subjects.flatMap((subject) => {
    const list = [
      {
        id: `sub-${subject.id}`,
        category: "Subjects",
        title: `${subject.name} (Exam: ${subject.exam_date})`,
        subtitle: `${subject.topics?.length || 0} topics · Weight: ${subject.weightage}/10`,
        icon: BookOpen,
        action: () => onNavigate("Goals & subjects"),
      },
    ];
    if (subject.topics) {
      subject.topics.forEach((topic) => {
        list.push({
          id: `top-${topic.id}`,
          category: "Topics",
          title: topic.name,
          subtitle: `${subject.name} · Est. ${topic.est_hours}h · Diff: ${topic.difficulty}/5`,
          icon: Sparkles,
          action: () => onNavigate("Study plan"),
        });
      });
    }
    return list;
  });

  const allItems = [...defaultCommands, ...subjectCommands];
  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : defaultCommands;

  function handleSelect(item) {
    if (item && item.action) {
      item.action();
      onClose();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="command-search-header">
          <Search size={18} className="command-search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, subject, topic, or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="command-esc-badge" onClick={onClose}>ESC</span>
        </div>

        <div className="command-results-list">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon || Sparkles;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`command-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="command-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="command-item-text">
                    <span className="command-item-title">{item.title}</span>
                    {item.subtitle && (
                      <span className="command-item-subtitle">{item.subtitle}</span>
                    )}
                  </div>
                  <span className="command-item-category">{item.category}</span>
                </div>
              );
            })
          ) : (
            <div className="command-empty">
              No matching commands or topics for "{query}".
            </div>
          )}
        </div>

        <div className="command-footer">
          <div className="command-keys-hint">
            <span><b>↑↓</b> to navigate</span>
            <span><b>↵</b> to select</span>
            <span><b>esc</b> to close</span>
          </div>
          <span className="command-brand-tag">Daymark Command</span>
        </div>
      </div>
    </div>
  );
}
