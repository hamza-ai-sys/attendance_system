"use client";

import { useState } from "react";
import { addEmployeeNote, getEmployeeNotes, submitPerformanceEvaluation } from "./actions";

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string | null;
  roleName: string;
}

export interface TemplateField {
  id: string;
  label: string;
  type: "rating" | "text" | "number" | "select";
  options?: string[];
  required?: boolean;
}

export interface ActiveTemplate {
  id: string;
  title: string;
  description?: string | null;
  fields: TemplateField[];
  startDate: string;
  endDate: string;
}

export interface NoteItem {
  id: string;
  content: string;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  authorName: string;
  authorRole: string;
  isOwn: boolean;
}

interface TeamClientViewProps {
  members: TeamMember[];
  activeTemplate: ActiveTemplate | null;
  currentUserId: string;
}

export function TeamClientView({ members, activeTemplate }: TeamClientViewProps) {
  // Modal state for notes
  const [selectedNoteEmployee, setSelectedNoteEmployee] = useState<TeamMember | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteVisibility, setNewNoteVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Modal state for performance evaluation
  const [selectedEvalEmployee, setSelectedEvalEmployee] = useState<TeamMember | null>(null);
  const [evalResponses, setEvalResponses] = useState<Record<string, string | number>>({});
  const [evalComments, setEvalComments] = useState("");
  const [submittingEval, setSubmittingEval] = useState(false);
  const [evalStatusMsg, setEvalStatusMsg] = useState<string | null>(null);

  // Open note modal and fetch existing notes
  const handleOpenNotes = async (member: TeamMember) => {
    setSelectedNoteEmployee(member);
    setLoadingNotes(true);
    try {
      const fetchedNotes = await getEmployeeNotes(member.id);
      setNotes(fetchedNotes);
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNoteEmployee || !newNoteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const formData = new FormData();
      formData.append("employeeId", selectedNoteEmployee.id);
      formData.append("content", newNoteContent.trim());
      formData.append("visibility", newNoteVisibility);

      await addEmployeeNote(formData);
      setNewNoteContent("");
      // Refresh notes list
      const updatedNotes = await getEmployeeNotes(selectedNoteEmployee.id);
      setNotes(updatedNotes);
    } catch (err) {
      console.error("Error adding note", err);
      alert("Failed to add note.");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Open performance evaluation modal
  const handleOpenEval = (member: TeamMember) => {
    setSelectedEvalEmployee(member);
    setEvalResponses({});
    setEvalComments("");
    setEvalStatusMsg(null);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvalEmployee || !activeTemplate) return;

    setSubmittingEval(true);
    setEvalStatusMsg(null);

    try {
      await submitPerformanceEvaluation({
        templateId: activeTemplate.id,
        employeeId: selectedEvalEmployee.id,
        responses: evalResponses,
        comments: evalComments
      });
      setEvalStatusMsg("Evaluation submitted successfully!");
      setTimeout(() => {
        setSelectedEvalEmployee(null);
      }, 1200);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit evaluation";
      setEvalStatusMsg(`Error: ${errorMsg}`);
    } finally {
      setSubmittingEval(false);
    }
  };

  return (
    <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {activeTemplate && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(236, 72, 153, 0.15))",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backdropFilter: "blur(12px)"
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 6px 0", color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>✨</span> Performance Evaluation Period Active
            </h3>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "#cbd5e1" }}>
              HR Document: <strong>{activeTemplate.title}</strong> (Active: {new Date(activeTemplate.startDate).toLocaleDateString()} to {new Date(activeTemplate.endDate).toLocaleDateString()})
            </p>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: "1.3rem", color: "#f8fafc", margin: "10px 0 0 0" }}>Team Members & Actions</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {members.map((member) => (
          <div
            key={member.id}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", color: "#f1f5f9" }}>{member.fullName}</h3>
                <span
                  style={{
                    background: "rgba(139, 92, 246, 0.2)",
                    color: "#c084fc",
                    border: "1px solid rgba(139, 92, 246, 0.4)",
                    padding: "3px 8px",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 600
                  }}
                >
                  {member.roleName}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>{member.email}</p>
              {member.employeeCode && (
                <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>Code: {member.employeeCode}</p>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
              {/* Note Button */}
              <button
                type="button"
                onClick={() => handleOpenNotes(member)}
                style={{
                  background: "rgba(255, 255, 255, 0.07)",
                  border: "1px solid var(--border)",
                  color: "#f8fafc",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease"
                }}
              >
                📝 Employee Notes
              </button>

              {/* Shining Glowing Button for Active HR Performance Evaluation */}
              {activeTemplate && (
                <button
                  type="button"
                  onClick={() => handleOpenEval(member)}
                  className="shining-button"
                  title="Click to fill employee performance evaluation set by HR"
                >
                  ✨ Fill Performance Evaluation
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 1. EMPLOYEE NOTES MODAL */}
      {selectedNoteEmployee && (
        <div className="modal-overlay" onClick={() => setSelectedNoteEmployee(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Notes: {selectedNoteEmployee.fullName}</h2>
              <button type="button" className="close-btn" onClick={() => setSelectedNoteEmployee(null)}>
                ✕
              </button>
            </div>

            {/* Note Creation Form */}
            <form onSubmit={handleAddNoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.9rem", color: "#cbd5e1", fontWeight: 600 }}>Note Visibility:</label>
                <div style={{ display: "flex", gap: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.9rem" }}>
                    <input
                      type="radio"
                      name="visibility"
                      value="PRIVATE"
                      checked={newNoteVisibility === "PRIVATE"}
                      onChange={() => setNewNoteVisibility("PRIVATE")}
                    />
                    <span>🔒 Personal Note (Private - Only Manager can see)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.9rem" }}>
                    <input
                      type="radio"
                      name="visibility"
                      value="PUBLIC"
                      checked={newNoteVisibility === "PUBLIC"}
                      onChange={() => setNewNoteVisibility("PUBLIC")}
                    />
                    <span>🌐 Public Note (Visible to HR & Manager)</span>
                  </label>
                </div>
              </div>

              <textarea
                rows={3}
                placeholder={`Write a note about ${selectedNoteEmployee.fullName}...`}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "#fff",
                  fontSize: "0.9rem",
                  resize: "vertical"
                }}
              />

              <button
                type="submit"
                disabled={submittingNote}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontWeight: 600,
                  cursor: submittingNote ? "not-allowed" : "pointer",
                  alignSelf: "flex-end"
                }}
              >
                {submittingNote ? "Saving..." : "Save Note"}
              </button>
            </form>

            <hr style={{ borderColor: "var(--border)", margin: "10px 0" }} />

            {/* Existing Notes List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "1rem", color: "#cbd5e1", margin: 0 }}>Previous Notes</h3>
              {loadingNotes ? (
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading notes...</p>
              ) : notes.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No notes recorded for this employee yet.</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`note-badge ${note.visibility.toLowerCase()}`}>
                          {note.visibility === "PRIVATE" ? "🔒 Personal Note" : "🌐 Public Note"}
                        </span>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>
                          {note.authorName} ({note.authorRole})
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#cbd5e1", whiteSpace: "pre-wrap" }}>
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PERFORMANCE EVALUATION MODAL */}
      {selectedEvalEmployee && activeTemplate && (
        <div className="modal-overlay" onClick={() => setSelectedEvalEmployee(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Performance Evaluation: {selectedEvalEmployee.fullName}</h2>
              <button type="button" className="close-btn" onClick={() => setSelectedEvalEmployee(null)}>
                ✕
              </button>
            </div>

            <div style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "10px", padding: "12px 16px" }}>
              <p style={{ margin: 0, fontWeight: 600, color: "#c084fc", fontSize: "0.95rem" }}>Document: {activeTemplate.title}</p>
              {activeTemplate.description && (
                <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>{activeTemplate.description}</p>
              )}
            </div>

            {evalStatusMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  background: evalStatusMsg.startsWith("Error") ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  color: evalStatusMsg.startsWith("Error") ? "#fca5a5" : "#6ee7b7",
                  border: evalStatusMsg.startsWith("Error") ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)"
                }}
              >
                {evalStatusMsg}
              </div>
            )}

            <form onSubmit={handleSubmitEvaluation} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {activeTemplate.fields.map((field) => (
                <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.9rem", color: "#f1f5f9", fontWeight: 600 }}>
                    {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
                  </label>

                  {field.type === "rating" && (
                    <div style={{ display: "flex", gap: "12px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvalResponses({ ...evalResponses, [field.id]: star })}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "10px",
                            border: evalResponses[field.id] === star ? "2px solid #f59e0b" : "1px solid var(--border)",
                            background: evalResponses[field.id] === star ? "rgba(245, 158, 11, 0.2)" : "rgba(15, 23, 42, 0.5)",
                            color: evalResponses[field.id] === star ? "#fbbf24" : "#94a3b8",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: "1rem"
                          }}
                        >
                          ★ {star}
                        </button>
                      ))}
                    </div>
                  )}

                  {field.type === "text" && (
                    <textarea
                      rows={2}
                      value={(evalResponses[field.id] as string) || ""}
                      onChange={(e) => setEvalResponses({ ...evalResponses, [field.id]: e.target.value })}
                      required={field.required}
                      placeholder={`Enter details for ${field.label}...`}
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "10px",
                        color: "#fff",
                        fontSize: "0.9rem"
                      }}
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={(evalResponses[field.id] as number) || ""}
                      onChange={(e) => setEvalResponses({ ...evalResponses, [field.id]: Number(e.target.value) })}
                      required={field.required}
                      placeholder="Score (0-100)"
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "10px",
                        color: "#fff",
                        fontSize: "0.9rem"
                      }}
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      value={(evalResponses[field.id] as string) || ""}
                      onChange={(e) => setEvalResponses({ ...evalResponses, [field.id]: e.target.value })}
                      required={field.required}
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "10px",
                        color: "#fff",
                        fontSize: "0.9rem"
                      }}
                    >
                      <option value="">Select option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.9rem", color: "#f1f5f9", fontWeight: 600 }}>Overall Evaluation Comments</label>
                <textarea
                  rows={3}
                  value={evalComments}
                  onChange={(e) => setEvalComments(e.target.value)}
                  placeholder="Provide final evaluation summary & constructive feedback..."
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

              <button
                type="submit"
                disabled={submittingEval}
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #ec4899)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: submittingEval ? "not-allowed" : "pointer",
                  marginTop: "10px"
                }}
              >
                {submittingEval ? "Submitting..." : "Submit Performance Evaluation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
