"use client";

import { useState } from "react";
import { submitPerformanceEvaluation } from "../app/team-attendance/actions";

export interface TeamMemberSummary {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string | null;
  roleName: string;
}

export interface PerformanceTemplateField {
  id: string;
  label: string;
  type: "rating" | "text" | "number" | "select";
  options?: string[];
  required?: boolean;
}

export interface ActivePerformanceTemplate {
  id: string;
  title: string;
  description?: string | null;
  fields: PerformanceTemplateField[];
  startDate: string;
  endDate: string;
}

interface TeamPerformanceEvaluationModalProps {
  employee: TeamMemberSummary;
  template: ActivePerformanceTemplate;
  onClose: () => void;
}

export function TeamPerformanceEvaluationModal({
  employee,
  template,
  onClose
}: TeamPerformanceEvaluationModalProps) {
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const updateResponse = (fieldId: string, value: string | number) => {
    setResponses((current) => ({ ...current, [fieldId]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      await submitPerformanceEvaluation({
        templateId: template.id,
        employeeId: employee.id,
        responses,
        comments
      });
      setStatusMessage("Evaluation submitted successfully!");
      setTimeout(onClose, 1200);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit evaluation";
      setStatusMessage(`Error: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Performance Evaluation: {employee.fullName}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          style={{
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "10px",
            padding: "12px 16px"
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: "#c084fc", fontSize: "0.95rem" }}>
            Document: {template.title}
          </p>
          {template.description && (
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>
              {template.description}
            </p>
          )}
        </div>

        {statusMessage && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.9rem",
              background: statusMessage.startsWith("Error")
                ? "rgba(239, 68, 68, 0.2)"
                : "rgba(16, 185, 129, 0.2)",
              color: statusMessage.startsWith("Error") ? "#fca5a5" : "#6ee7b7"
            }}
          >
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {template.fields.map((field) => (
            <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.9rem", color: "#f1f5f9", fontWeight: 600 }}>
                {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
              </label>

              {field.type === "rating" && (
                <div style={{ display: "flex", gap: "12px" }}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => updateResponse(field.id, rating)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "10px",
                        border:
                          responses[field.id] === rating
                            ? "2px solid #f59e0b"
                            : "1px solid var(--border)",
                        background:
                          responses[field.id] === rating
                            ? "rgba(245, 158, 11, 0.2)"
                            : "rgba(15, 23, 42, 0.5)",
                        color: responses[field.id] === rating ? "#fbbf24" : "#94a3b8",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      ★ {rating}
                    </button>
                  ))}
                </div>
              )}

              {field.type === "text" && (
                <textarea
                  rows={2}
                  value={(responses[field.id] as string) || ""}
                  onChange={(event) => updateResponse(field.id, event.target.value)}
                  required={field.required}
                  placeholder={`Enter details for ${field.label}...`}
                />
              )}

              {field.type === "number" && (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={(responses[field.id] as number) || ""}
                  onChange={(event) => updateResponse(field.id, Number(event.target.value))}
                  required={field.required}
                  placeholder="Score (0-100)"
                />
              )}

              {field.type === "select" && (
                <select
                  value={(responses[field.id] as string) || ""}
                  onChange={(event) => updateResponse(field.id, event.target.value)}
                  required={field.required}
                >
                  <option value="">Select option...</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontWeight: 600 }}>
            Overall Evaluation Comments
            <textarea
              rows={3}
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              placeholder="Provide final evaluation summary & constructive feedback..."
            />
          </label>

          <button type="submit" disabled={submitting} className="primary-btn">
            {submitting ? "Submitting..." : "Submit Performance Evaluation"}
          </button>
        </form>
      </div>
    </div>
  );
}
