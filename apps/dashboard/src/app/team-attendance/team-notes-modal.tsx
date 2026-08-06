"use client";

import { useEffect, useState } from "react";
import type { TeamMemberSummary } from "../../components/team-performance-evaluation-modal";
import { addEmployeeNote, getEmployeeNotes } from "./actions";

interface NoteItem {
  id: string;
  content: string;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  authorName: string;
  authorRole: string;
  isOwn: boolean;
}

interface TeamNotesModalProps {
  employee: TeamMemberSummary;
  onClose: () => void;
}

export function TeamNotesModal({ employee, onClose }: TeamNotesModalProps) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getEmployeeNotes(employee.id)
      .then((items) => active && setNotes(items))
      .catch((error: unknown) => console.error("Failed to load notes", error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [employee.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("employeeId", employee.id);
      formData.append("content", content.trim());
      formData.append("visibility", visibility);
      await addEmployeeNote(formData);
      setContent("");
      setNotes(await getEmployeeNotes(employee.id));
    } catch (error) {
      console.error("Error adding note", error);
      alert("Failed to add note.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Employee Notes: {employee.fullName}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: "0.9rem", color: "#cbd5e1", fontWeight: 600 }}>
              Note visibility
            </legend>
            <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
              {(["PRIVATE", "PUBLIC"] as const).map((option) => (
                <label key={option} style={{ display: "flex", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === option}
                    onChange={() => setVisibility(option)}
                  />
                  {option === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
                </label>
              ))}
            </div>
          </fieldset>

          <textarea
            rows={3}
            placeholder={`Write a note about ${employee.fullName}...`}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
          <button type="submit" disabled={submitting} className="primary-btn">
            {submitting ? "Saving..." : "Save Note"}
          </button>
        </form>

        <hr style={{ borderColor: "var(--border)", margin: "10px 0" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "1rem", color: "#cbd5e1", margin: 0 }}>Previous Notes</h3>
          {loading ? (
            <p className="muted">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="muted">No notes recorded for this employee yet.</p>
          ) : (
            notes.map((note) => (
              <article key={note.id} className="panel" style={{ cursor: "default", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span className={`note-badge ${note.visibility.toLowerCase()}`}>
                    {note.visibility === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
                  </span>
                  <time className="muted" style={{ fontSize: "0.75rem" }}>
                    {new Date(note.createdAt).toLocaleString()}
                  </time>
                </div>
                <strong style={{ fontSize: "0.85rem" }}>
                  {note.authorName} ({note.authorRole})
                </strong>
                <p style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>{note.content}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
