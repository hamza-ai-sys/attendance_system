"use client";

import { useState } from "react";
import { createPerformanceTemplate, deletePerformanceTemplate, type FieldDefinition } from "./actions";

export interface TemplateData {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  fields: FieldDefinition[];
  createdAt: string;
  creatorName: string;
  evaluationCount: number;
}

export interface EvaluationData {
  id: string;
  templateTitle: string;
  employeeName: string;
  employeeEmail: string;
  evaluatorName: string;
  evaluatorRole: string;
  overallScore: number | null;
  comments: string | null;
  submittedAt: string;
  responses: Record<string, string | number>;
  fields: FieldDefinition[];
}

interface PerformanceClientViewProps {
  templates: TemplateData[];
  evaluations: EvaluationData[];
}

export function PerformanceClientView({ templates, evaluations }: PerformanceClientViewProps) {
  // Modal state for HR Form Builder
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Default start date = today, end date = 14 days from now
  const nowStr = new Date().toISOString().slice(0, 16);
  const defaultEndStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  
  const [startDate, setStartDate] = useState(nowStr);
  const [endDate, setEndDate] = useState(defaultEndStr);

  const [fields, setFields] = useState<FieldDefinition[]>([
    { id: "f_1", label: "Technical & Job Knowledge", type: "rating", required: true },
    { id: "f_2", label: "Team Collaboration & Communication", type: "rating", required: true },
    { id: "f_3", label: "Punctuality & Reliability", type: "rating", required: true },
    { id: "f_4", label: "Key Achievements & Comments", type: "text", required: false }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Modal state for viewing evaluation details
  const [selectedEval, setSelectedEval] = useState<EvaluationData | null>(null);

  const handleAddField = () => {
    const newId = `f_${Date.now()}`;
    setFields([...fields, { id: newId, label: "", type: "rating", required: true }]);
  };

  const handleRemoveField = (id: string) => {
    if (fields.length <= 1) {
      alert("At least one field is required.");
      return;
    }
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleFieldChange = (id: string, key: keyof FieldDefinition, value: FieldDefinition[keyof FieldDefinition]) => {
    setFields(
      fields.map((f) => {
        if (f.id === id) {
          return { ...f, [key]: value };
        }
        return f;
      })
    );
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    // Validate fields
    const emptyField = fields.find((f) => !f.label.trim());
    if (emptyField) {
      setStatusMsg("Error: All form fields must have a valid label.");
      setSubmitting(false);
      return;
    }

    try {
      await createPerformanceTemplate({
        title,
        description,
        startDate,
        endDate,
        fields
      });
      setStatusMsg("Performance Document created successfully!");
      setTimeout(() => {
        setShowBuilderModal(false);
        setTitle("");
        setDescription("");
      }, 1000);
    } catch (err: unknown) {
      const errorStr = err instanceof Error ? err.message : "Failed to create template";
      setStatusMsg(`Error: ${errorStr}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this performance template?")) return;
    try {
      await deletePerformanceTemplate(id);
    } catch {
      alert("Failed to delete template");
    }
  };

  const getTemplateStatus = (startStr: string, endStr: string) => {
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (now >= start && now <= end) {
      return { label: "✨ Active Now", color: "#34d399", bg: "rgba(52, 211, 153, 0.15)", border: "rgba(52, 211, 153, 0.4)" };
    }
    if (now < start) {
      return { label: "⏳ Scheduled", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.15)", border: "rgba(96, 165, 250, 0.4)" };
    }
    return { label: "📁 Expired", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", border: "rgba(148, 163, 184, 0.4)" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Banner & Define Button */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))",
          border: "1px solid rgba(139, 92, 246, 0.4)",
          borderRadius: "16px",
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "1.4rem", color: "#f8fafc" }}>
            HR Employee Performance Management
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem" }}>
            Define custom evaluation documents, schedule manager submission date windows, and track team performance metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBuilderModal(true)}
          style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "#ffffff",
            fontWeight: 600,
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap"
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1 }}>+</span> Define Performance Document
        </button>
      </div>

      {/* Templates Section */}
      <section className="panel" style={{ cursor: "default", display: "block" }}>
        <h2 style={{ fontSize: "1.3rem", color: "#f1f5f9", marginBottom: "16px" }}>Performance Templates & Schedule</h2>

        {templates.length === 0 ? (
          <p className="muted">No performance templates defined yet. Click "Define Performance Document" above to create one.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "20px" }}>
            {templates.map((tpl) => {
              const status = getTemplateStatus(tpl.startDate, tpl.endDate);
              return (
                <div
                  key={tpl.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "22px 26px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", color: "#f8fafc", fontWeight: 700 }}>{tpl.title}</h3>
                      {tpl.description && <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>{tpl.description}</p>}
                    </div>

                    <span
                      style={{
                        background: status.bg,
                        color: status.color,
                        border: `1px solid ${status.border}`,
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "0.85rem",
                      color: "#cbd5e1"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Active Window:</span>
                      <strong style={{ color: "#f1f5f9" }}>
                        {new Date(tpl.startDate).toLocaleDateString()} to {new Date(tpl.endDate).toLocaleDateString()}
                      </strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Criteria Fields:</span>
                      <strong style={{ color: "#c084fc" }}>{tpl.fields.length} fields</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Evaluations Submitted:</span>
                      <strong style={{ color: "#60a5fa" }}>{tpl.evaluationCount} responses</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto" }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        color: "#fca5a5",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      🗑️ Delete Template
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Evaluation Submissions Table & Analysis */}
      <section className="panel" style={{ cursor: "default", display: "block" }}>
        <h2 style={{ fontSize: "1.3rem", color: "#f1f5f9", marginBottom: "16px" }}>Submitted Manager Evaluations</h2>

        {evaluations.length === 0 ? (
          <p className="muted">No manager evaluations submitted yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 16px" }}>Employee</th>
                  <th style={{ padding: "12px 16px" }}>Evaluator / Manager</th>
                  <th style={{ padding: "12px 16px" }}>Document Title</th>
                  <th style={{ padding: "12px 16px" }}>Overall Score</th>
                  <th style={{ padding: "12px 16px" }}>Submitted Date</th>
                  <th style={{ padding: "12px 16px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <strong style={{ color: "#f8fafc" }}>{ev.employeeName}</strong>
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{ev.employeeEmail}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ color: "#e2e8f0" }}>{ev.evaluatorName}</span>
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{ev.evaluatorRole}</div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#cbd5e1" }}>{ev.templateTitle}</td>
                    <td style={{ padding: "14px 16px" }}>
                      {ev.overallScore !== null ? (
                        <span
                          style={{
                            background: "rgba(245, 158, 11, 0.2)",
                            color: "#fbbf24",
                            border: "1px solid rgba(245, 158, 11, 0.4)",
                            padding: "4px 10px",
                            borderRadius: "10px",
                            fontWeight: 700,
                            fontSize: "0.9rem"
                          }}
                        >
                          ★ {ev.overallScore} / 5
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>Text Feedback</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "0.85rem" }}>
                      {new Date(ev.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedEval(ev)}
                        style={{
                          background: "rgba(59, 130, 246, 0.15)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          color: "#60a5fa",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        🔍 View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 1. HR FORM BUILDER MODAL */}
      {showBuilderModal && (
        <div className="modal-overlay" onClick={() => setShowBuilderModal(false)}>
          <div className="modal-card" style={{ maxWidth: "750px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Define Employee Performance Document</h2>
              <button type="button" className="close-btn" onClick={() => setShowBuilderModal(false)}>
                ✕
              </button>
            </div>

            {statusMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  background: statusMsg.startsWith("Error") ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  color: statusMsg.startsWith("Error") ? "#fca5a5" : "#6ee7b7",
                  border: statusMsg.startsWith("Error") ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)"
                }}
              >
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleCreateTemplate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.9rem", color: "#f1f5f9", fontWeight: 600 }}>Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 2026 Employee Performance Evaluation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "10px",
                    color: "#fff",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.9rem", color: "#f1f5f9", fontWeight: 600 }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Instructions for managers filling this form..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "10px",
                    color: "#fff",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              {/* Scheduled Active Date Window */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.9rem", color: "#f1f5f9", fontWeight: 600 }}>
                    📅 Active Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      padding: "10px",
                      color: "#fff",
                      fontSize: "0.9rem"
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>When shining button appears on manager screen</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.9rem", color: "#f1f5f9", fontWeight: 600 }}>
                    🏁 Active End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      padding: "10px",
                      color: "#fff",
                      fontSize: "0.9rem"
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Deadline for evaluation submission</span>
                </div>
              </div>

              {/* Dynamic Fields Builder */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1rem", color: "#f8fafc", margin: 0 }}>Form Fields & Criteria</h3>
                  <button
                    type="button"
                    onClick={handleAddField}
                    style={{
                      background: "rgba(139, 92, 246, 0.2)",
                      border: "1px solid rgba(139, 92, 246, 0.4)",
                      color: "#c084fc",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    ➕ Add Field
                  </button>
                </div>

                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <span style={{ color: "#94a3b8", fontWeight: 700 }}>#{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Field Label (e.g. Communication, Productivity)..."
                        value={field.label}
                        onChange={(e) => handleFieldChange(field.id, "label", e.target.value)}
                        required
                        style={{
                          flex: 2,
                          background: "rgba(15, 23, 42, 0.6)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          color: "#fff",
                          fontSize: "0.9rem"
                        }}
                      />
                      <select
                        value={field.type}
                        onChange={(e) => handleFieldChange(field.id, "type", e.target.value as FieldDefinition["type"])}
                        style={{
                          flex: 1,
                          background: "rgba(15, 23, 42, 0.6)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          color: "#fff",
                          fontSize: "0.9rem"
                        }}
                      >
                        <option value="rating">Rating (1 to 5 Stars)</option>
                        <option value="text">Text Response</option>
                        <option value="number">Numeric Score (0-100)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "none",
                          color: "#ef4444",
                          padding: "8px",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: submitting ? "not-allowed" : "pointer",
                  marginTop: "10px"
                }}
              >
                {submitting ? "Saving Document..." : "Save & Publish Document"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. VIEW EVALUATION DETAILS MODAL */}
      {selectedEval && (
        <div className="modal-overlay" onClick={() => setSelectedEval(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Performance Evaluation Details</h2>
              <button type="button" className="close-btn" onClick={() => setSelectedEval(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.04)", borderRadius: "12px", padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>EMPLOYEE</div>
                  <div style={{ fontWeight: 700, color: "#f8fafc" }}>{selectedEval.employeeName}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>EVALUATOR / MANAGER</div>
                  <div style={{ fontWeight: 700, color: "#f8fafc" }}>{selectedEval.evaluatorName} ({selectedEval.evaluatorRole})</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>DOCUMENT TITLE</div>
                  <div style={{ fontWeight: 600, color: "#c084fc" }}>{selectedEval.templateTitle}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>OVERALL SCORE</div>
                  <div style={{ fontWeight: 700, color: "#fbbf24" }}>
                    {selectedEval.overallScore !== null ? `★ ${selectedEval.overallScore} / 5` : "N/A"}
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: "1rem", color: "#cbd5e1", margin: "8px 0 0 0" }}>Field Responses</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(selectedEval.responses).map(([fieldId, val]) => {
                  const fieldDef = selectedEval.fields.find((f) => f.id === fieldId);
                  const label = fieldDef ? fieldDef.label : fieldId;
                  return (
                    <div
                      key={fieldId}
                      style={{
                        background: "rgba(15, 23, 42, 0.5)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "12px 16px"
                      }}
                    >
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: "1rem", color: "#f1f5f9", fontWeight: 600, marginTop: "4px" }}>
                        {fieldDef?.type === "rating" ? `★ ${val} / 5` : String(val)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedEval.comments && (
                <div style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "0.85rem", color: "#c084fc", fontWeight: 700 }}>Evaluator Comments</div>
                  <p style={{ margin: "4px 0 0 0", color: "#e2e8f0", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                    {selectedEval.comments}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
