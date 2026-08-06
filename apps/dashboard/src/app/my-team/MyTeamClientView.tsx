"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { addEmployeeNote, submitPerformanceEvaluation } from "../team-attendance/actions";

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

interface MyTeamClientViewProps {
  members: TeamMember[];
  activeTemplate: ActiveTemplate | null;
  currentUserId: string;
}

export function MyTeamClientView({ members, activeTemplate }: MyTeamClientViewProps) {
  // Modal state for notes
  const [selectedNoteEmployee, setSelectedNoteEmployee] = useState<TeamMember | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(true);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Modal state for performance evaluation
  const [selectedEvalEmployee, setSelectedEvalEmployee] = useState<TeamMember | null>(null);
  const [evalResponses, setEvalResponses] = useState<Record<string, string | number>>({});
  const [evalComments, setEvalComments] = useState("");
  const [submittingEval, setSubmittingEval] = useState(false);
  const [evalStatusMsg, setEvalStatusMsg] = useState<string | null>(null);

  // Open note modal
  const handleOpenNotes = (member: TeamMember) => {
    setSelectedNoteEmployee(member);
    setIsPrivateNote(true);
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNoteEmployee || !newNoteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const formData = new FormData();
      formData.append("employeeId", selectedNoteEmployee.id);
      formData.append("content", newNoteContent.trim());
      formData.append("visibility", isPrivateNote ? "PRIVATE" : "PUBLIC");

      await addEmployeeNote(formData);
      setNewNoteContent("");
      setSelectedNoteEmployee(null);
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
    <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {activeTemplate && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(236, 72, 153, 0.15))",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            borderRadius: "16px",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backdropFilter: "blur(12px)"
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 4px 0", color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
              <span>✨</span> Performance Evaluation Window Active
            </h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#cbd5e1" }}>
              HR Form: <strong>{activeTemplate.title}</strong> (Active: {new Date(activeTemplate.startDate).toLocaleDateString()} to {new Date(activeTemplate.endDate).toLocaleDateString()})
            </p>
          </div>
        </div>
      )}

      {/* Non-table Column / List View for Team Members */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "1.3rem", color: "#f8fafc", margin: 0 }}>Team Members</h2>
          <span className="muted" style={{ fontSize: "0.9rem" }}>{members.length} members</span>
        </div>

        {members.length === 0 ? (
          <p className="muted">No team members found.</p>
        ) : (
          members.map((member) => {
            const initials = member.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            return (
              <div
                key={member.id}
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Employee Info Block */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #60a5fa, #c084fc)",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                    }}
                  >
                    {initials}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <strong style={{ fontSize: "1.1rem", color: "#f8fafc" }}>{member.fullName}</strong>
                      <span
                        style={{
                          background: "rgba(139, 92, 246, 0.2)",
                          color: "#c084fc",
                          border: "1px solid rgba(139, 92, 246, 0.4)",
                          padding: "2px 8px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 600
                        }}
                      >
                        {member.roleName}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                      {member.email} {member.employeeCode ? `• Code: ${member.employeeCode}` : ""}
                    </span>
                  </div>
                </div>

                {/* Right Action Icons Only */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* 1. Add Note Vector Icon Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenNotes(member)}
                    className="prominent-notes-icon-btn"
                    title="Add Employee Note"
                    aria-label="Add Employee Note"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  {/* 2. Previous Notes History Link Icon Button (Opens New Page) */}
                  <Link
                    href={`/my-team/notes?employeeId=${member.id}` as Route}
                    className="prominent-history-icon-btn"
                    title="Open Previous Notes History Page"
                    aria-label="Open Previous Notes History Page"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8v4l3 3" />
                      <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
                    </svg>
                  </Link>

                  {/* 3. Bold Performance Document Vector Icon Button */}
                  {activeTemplate && (
                    <button
                      type="button"
                      onClick={() => handleOpenEval(member)}
                      className="prominent-performance-icon-btn"
                      title="Fill Employee Performance Evaluation Document"
                      aria-label="Fill Employee Performance Evaluation Document"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <polygon points="12 11 13.5 14 17 14.3 14.3 16.7 15.2 20 12 18.2 8.8 20 9.7 16.7 7 14.3 10.5 14" fill="currentColor" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. EMPLOYEE ADD NOTE MODAL (Compact & Short Size) */}
      {selectedNoteEmployee && (
        <div className="modal-overlay" onClick={() => setSelectedNoteEmployee(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px", padding: "20px", gap: "14px" }}>
            <div className="modal-header" style={{ paddingBottom: "10px" }}>
              <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Add Note: {selectedNoteEmployee.fullName}</h2>
              <button type="button" className="close-btn" onClick={() => setSelectedNoteEmployee(null)}>
                ✕
              </button>
            </div>

            {/* Note Creation Form */}
            <form onSubmit={handleAddNoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <textarea
                rows={2}
                placeholder={`Write a note about ${selectedNoteEmployee.fullName}...`}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  color: "#fff",
                  fontSize: "0.88rem",
                  resize: "vertical"
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", color: "#e2e8f0" }}>
                  <input
                    type="checkbox"
                    checked={isPrivateNote}
                    onChange={(e) => setIsPrivateNote(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#8b5cf6", cursor: "pointer" }}
                  />
                  <span>Private</span>
                </label>

                <button
                  type="submit"
                  disabled={submittingNote}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: submittingNote ? "not-allowed" : "pointer"
                  }}
                >
                  {submittingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>

            <hr style={{ borderColor: "var(--border)", margin: "4px 0" }} />

            {/* Link to Open Full Previous Notes History Page */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link
                href={`/my-team/notes?employeeId=${selectedNoteEmployee.id}` as Route}
                className="back-link"
                style={{ textDecoration: "none", fontSize: "0.8rem", padding: "6px 12px", color: "#60a5fa", borderColor: "rgba(59, 130, 246, 0.4)" }}
              >
                Previous Notes ➔
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. PERFORMANCE EVALUATION MODAL */}
      {selectedEvalEmployee && activeTemplate && (
        <div className="modal-overlay" onClick={() => setSelectedEvalEmployee(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px", padding: "24px", gap: "16px" }}>
            <div className="modal-header" style={{ paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#f8fafc" }}>
                Performance Evaluation: <span style={{ color: "#c084fc" }}>{selectedEvalEmployee.fullName}</span>
              </h2>
              <button type="button" className="close-btn" onClick={() => setSelectedEvalEmployee(null)}>
                ✕
              </button>
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

            <form onSubmit={handleSubmitEvaluation} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {activeTemplate.fields.map((field) => {
                const currentRating = (evalResponses[field.id] as number) || 0;
                const isRated = currentRating > 0;

                return (
                  <div key={field.id}>
                    {field.type === "rating" ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "4px 0"
                        }}
                      >
                        <label style={{ fontSize: "0.95rem", color: "#f1f5f9", fontWeight: 600, margin: 0 }}>
                          {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
                        </label>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isSelected = star <= currentRating;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEvalResponses({ ...evalResponses, [field.id]: star })}
                                  title={`Rate ${star} out of 5`}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "1.5rem",
                                    color: isSelected ? "#f59e0b" : "#475569",
                                    cursor: "pointer",
                                    padding: "0 2px",
                                    transition: "transform 0.15s ease, color 0.15s ease",
                                    transform: isSelected ? "scale(1.15)" : "scale(1.0)"
                                  }}
                                >
                                  ★
                                </button>
                              );
                            })}
                          </div>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: isRated ? "#fbbf24" : "#64748b",
                              minWidth: "36px",
                              textAlign: "right"
                            }}
                          >
                            {currentRating} / 5
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.95rem", color: "#f1f5f9", fontWeight: 600 }}>
                          {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
                        </label>

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
                    )}
                  </div>
                );
              })}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.95rem", color: "#f1f5f9", fontWeight: 600 }}>Overall Evaluation Comments</label>
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
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: submittingEval ? "not-allowed" : "pointer",
                  marginTop: "6px"
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
