import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Check,
  Search,
  Star,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

const EMPTY_TOPIC = { name: "", difficulty: 3, confidence: 3, est_hours: 2 };

export default function SubjectsPage({
  subjects = [],
  busy = false,
  runAction,
  api,
}) {
  const [goalText, setGoalText] = useState("");
  const [parsedSubjects, setParsedSubjects] = useState([]);
  const [parserMode, setParserMode] = useState("");
  const [clarification, setClarification] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    name: "",
    exam_date: "",
    weightage: 5,
    topics: [{ ...EMPTY_TOPIC }],
  });

  const sampleGoals = [
    "Physics exam on 20 Oct, weak in Optics. Math exam on 25 Oct, need practice with Calculus limits and integrals.",
    "GATE CS Exam in Feb 2027: Algorithms, Data Structures, Operating Systems.",
    "Biology finals on Nov 15: Cell Structure, Genetics primer, Plant Physiology.",
  ];

  async function handleParseGoals(e) {
    e.preventDefault();
    if (!goalText.trim()) return;

    await runAction(
      () => api.parseGoals(goalText),
      (result) =>
        result.clarification_needed ||
        (result.parser_mode === "local"
          ? "Goals extracted using rule-based local parser."
          : "Goals successfully parsed using Gemini AI!"),
      (result) => {
        setParsedSubjects(result.subjects || []);
        setParserMode(result.parser_mode || "gemini");
        setClarification(result.clarification_needed || "");
      }
    );
  }

  function updateTopicField(idx, field, value) {
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.map((t, i) => (i === idx ? { ...t, [field]: value } : t)),
    }));
  }

  function addTopicRow() {
    setForm((prev) => ({
      ...prev,
      topics: [...prev.topics, { ...EMPTY_TOPIC }],
    }));
  }

  function removeTopicRow(idx) {
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== idx),
    }));
  }

  async function handleSaveManual(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.exam_date) return;

    const payload = {
      ...form,
      topics: form.topics.filter((t) => t.name.trim()),
    };

    const saved = await runAction(
      () => api.createSubject(payload),
      `Successfully added "${form.name}"!`
    );

    if (saved) {
      setForm({
        name: "",
        exam_date: "",
        weightage: 5,
        topics: [{ ...EMPTY_TOPIC }],
      });
    }
  }

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topics?.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="subjects-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">CURRICULUM & TOPIC BREAKDOWN</div>
          <h1>Goals & Subjects</h1>
          <p>Organize your exam deadlines, estimate topic difficulty, and let AI structure your syllabus.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-outline"
            disabled={busy}
            onClick={() =>
              runAction(
                () => api.addSamples(),
                (res) =>
                  res?.length
                    ? `Loaded ${res.length} sample subjects!`
                    : "Sample subjects are already added to your workspace."
              )
            }
          >
            <Plus size={16} />
            <span>Load Sample Syllabus</span>
          </button>
        </div>
      </div>

      <div className="subjects-layout-grid">
        {/* Left Column: AI Brain-Dump & Manual Add */}
        <div className="subjects-forms-column">
          {/* AI Free-Text Goal Extractor */}
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">NATURAL LANGUAGE AI PARSER</span>
                <h2>Syllabus Brain-Dump</h2>
              </div>
              <div className="soft-icon">
                <Sparkles size={20} />
              </div>
            </div>
            <p className="panel-subtitle">
              Type or paste your raw exam schedule, topics you struggle with, or deadline notes. Gemini AI
              extracts structured topics, difficulties, and target dates.
            </p>

            <form onSubmit={handleParseGoals} className="ai-goal-form">
              <textarea
                rows="3"
                placeholder="e.g. Physics exam on 20 Oct, weak in optics. Math exam on 25 Oct, need practice with calculus..."
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                required
              />

              <div className="prompt-suggestion-chips" style={{ margin: "10px 0" }}>
                <span className="chips-label">Sample Prompts:</span>
                {sampleGoals.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    className="chip-btn"
                    onClick={() => setGoalText(sample)}
                  >
                    {sample.slice(0, 48)}...
                  </button>
                ))}
              </div>

              <div className="form-submit-row">
                <span className="quiet-hint">
                  Review extracted subjects below before saving.
                </span>
                <button
                  type="submit"
                  className="button button-primary button-small"
                  disabled={busy || !goalText.trim()}
                >
                  <Sparkles size={15} />
                  <span>Parse with AI</span>
                </button>
              </div>
            </form>

            {clarification && (
              <div className="clarification-hint">
                <span>💡 {clarification}</span>
              </div>
            )}

            {/* Parsed Results Preview */}
            {parsedSubjects.length > 0 && (
              <div className="parsed-results-box">
                <div className="parsed-header">
                  <b>AI Extracted Subjects ({parsedSubjects.length})</b>
                  <span className={`parser-badge ${parserMode}`}>
                    {parserMode === "local" ? "Rule-based Parser" : "Gemini LLM"}
                  </span>
                </div>

                <div className="parsed-cards">
                  {parsedSubjects.map((sub, idx) => (
                    <div key={idx} className="parsed-subject-card">
                      <div className="parsed-subject-meta">
                        <h4>{sub.subject_name}</h4>
                        <p>
                          Exam Date: <b>{sub.exam_date}</b> · {sub.topics.length} topics · Weight: {sub.weightage}/10
                        </p>
                        <div className="parsed-topics-tags">
                          {sub.topics.map((t, i) => (
                            <span key={i} className="topic-tag">
                              {t.topic_name} ({t.estimated_hours}h)
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        className="button button-success button-small"
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            () =>
                              api.createSubject({
                                name: sub.subject_name,
                                exam_date: sub.exam_date,
                                weightage: sub.weightage,
                                topics: sub.topics.map((t) => ({
                                  name: t.topic_name,
                                  difficulty: t.difficulty,
                                  confidence: t.confidence,
                                  est_hours: t.estimated_hours,
                                })),
                              }),
                            `Saved subject "${sub.subject_name}"!`,
                            () =>
                              setParsedSubjects((prev) =>
                                prev.filter((_, sIdx) => sIdx !== idx)
                              )
                          )
                        }
                      >
                        <Check size={14} />
                        <span>Save Subject</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Manual Add Subject Form */}
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">MANUAL ENTRY</span>
                <h2>Add Subject & Topics Manually</h2>
              </div>
              <div className="soft-icon emerald">
                <BookOpen size={20} />
              </div>
            </div>

            <form onSubmit={handleSaveManual} className="manual-subject-form">
              <div className="form-grid-2">
                <label className="field-group">
                  <span>Subject Name</span>
                  <input
                    type="text"
                    placeholder="e.g. Molecular Genetics, Machine Learning"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>
                <label className="field-group">
                  <span>Target Exam Date</span>
                  <input
                    type="date"
                    value={form.exam_date}
                    onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
                    required
                  />
                </label>
              </div>

              <div className="field-group">
                <div className="field-label-between">
                  <span>Exam Weightage / Priority:</span>
                  <b>{form.weightage} / 10</b>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={form.weightage}
                  onChange={(e) => setForm({ ...form, weightage: Number(e.target.value) })}
                />
              </div>

              {/* Topics List */}
              <div className="topics-builder-header">
                <b>Topics & Effort Breakdown ({form.topics.length})</b>
                <button
                  type="button"
                  className="button button-quiet button-small"
                  onClick={addTopicRow}
                >
                  <Plus size={14} />
                  <span>Add Topic</span>
                </button>
              </div>

              <div className="topic-rows-container">
                {form.topics.map((topic, idx) => (
                  <div key={idx} className="topic-input-grid">
                    <input
                      type="text"
                      placeholder="Topic name (e.g. Optics, Thermodynamics)"
                      value={topic.name}
                      onChange={(e) => updateTopicField(idx, "name", e.target.value)}
                      className="topic-name-input"
                      required={idx === 0}
                    />
                    <label className="topic-mini-label">
                      <span>Hours</span>
                      <input
                        type="number"
                        min="0.5"
                        max="60"
                        step="0.5"
                        value={topic.est_hours}
                        onChange={(e) =>
                          updateTopicField(idx, "est_hours", Number(e.target.value))
                        }
                      />
                    </label>
                    <label className="topic-mini-label">
                      <span>Diff (1-5)</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={topic.difficulty}
                        onChange={(e) =>
                          updateTopicField(idx, "difficulty", Number(e.target.value))
                        }
                      />
                    </label>
                    <label className="topic-mini-label">
                      <span>Conf (1-5)</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={topic.confidence}
                        onChange={(e) =>
                          updateTopicField(idx, "confidence", Number(e.target.value))
                        }
                      />
                    </label>
                    {form.topics.length > 1 && (
                      <button
                        type="button"
                        className="icon-button danger-icon"
                        onClick={() => removeTopicRow(idx)}
                        title="Remove topic"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-submit-row">
                <button
                  type="submit"
                  className="button button-primary button-small"
                  disabled={busy || !form.name.trim() || !form.exam_date}
                >
                  <Check size={15} />
                  <span>Save Subject & Topics</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Active Subject Cards */}
        <div className="subjects-list-column">
          <div className="subject-search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search subjects or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="section-row" style={{ margin: "14px 0" }}>
            <div>
              <span className="panel-kicker">SAVED CURRICULUM</span>
              <h3>Subjects ({filteredSubjects.length})</h3>
            </div>
          </div>

          {filteredSubjects.length > 0 ? (
            <div className="subject-cards-stack">
              {filteredSubjects.map((sub) => (
                <article key={sub.id} className="subject-card">
                  <div className="subject-card-top">
                    <div className="subject-avatar">
                      {sub.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="subject-header-info">
                      <h4>{sub.name}</h4>
                      <span className="subject-exam-badge">
                        <Calendar size={13} /> Exam: {sub.exam_date}
                      </span>
                    </div>
                    <button
                      className="icon-button danger-icon"
                      onClick={() =>
                        runAction(
                          () => api.deleteSubject(sub.id),
                          `Deleted subject "${sub.name}".`
                        )
                      }
                      title={`Delete ${sub.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="subject-card-meta">
                    <span>
                      <Layers size={13} /> {sub.topics?.length || 0} topics
                    </span>
                    <span>
                      <Star size={13} /> Priority: {sub.weightage}/10
                    </span>
                  </div>

                  {sub.topics?.length > 0 && (
                    <div className="subject-topics-list">
                      {sub.topics.map((topic) => (
                        <div key={topic.id} className="subject-topic-pill">
                          <b>{topic.name}</b>
                          <small>
                            {topic.est_hours}h · D:{topic.difficulty} C:{topic.confidence}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BookOpen size={22} className="empty-state-icon" />
              <b>No subjects found</b>
              <p>
                {searchQuery
                  ? `No subjects match "${searchQuery}".`
                  : "Add your first subject using the AI extractor or manual form."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
