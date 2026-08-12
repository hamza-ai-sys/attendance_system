"use client";

import { useState } from "react";
import { submitPerformanceEvaluation } from "../app/team-attendance/actions";
import type {
  ActivePerformanceTemplate,
  PerformanceTemplateField,
  TeamMemberSummary
} from "../app/team-management/types";

interface TeamPerformanceEvaluationModalProps {
  employee: TeamMemberSummary;
  template: ActivePerformanceTemplate;
  onClose: () => void;
}

function EvaluationField({
  field,
  value,
  onChange
}: {
  field: PerformanceTemplateField;
  value?: string | number;
  onChange: (value: string | number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontWeight: 600 }}>
        {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {field.type === "rating" && (
        <div style={{ display: "flex", gap: 12 }}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: value === rating ? "2px solid #f59e0b" : "1px solid var(--border)",
                background: value === rating ? "rgba(245,158,11,.2)" : "rgba(15,23,42,.5)",
                color: value === rating ? "#fbbf24" : "#94a3b8"
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
          value={(value as string) || ""}
          onChange={(event) => onChange(event.target.value)}
          required={field.required}
          placeholder={`Enter details for ${field.label}...`}
        />
      )}
      {field.type === "number" && (
        <input
          type="number"
          min="0"
          max="100"
          value={(value as number) || ""}
          onChange={(event) => onChange(Number(event.target.value))}
          required={field.required}
          placeholder="Score (0-100)"
        />
      )}
      {field.type === "select" && (
        <select
          value={(value as string) || ""}
          onChange={(event) => onChange(event.target.value)}
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
  );
}

function TemplateSummary({ template }: { template: ActivePerformanceTemplate }) {
  return (
    <div
      style={{
        background: "rgba(139,92,246,.1)",
        border: "1px solid rgba(139,92,246,.3)",
        borderRadius: 10,
        padding: "12px 16px"
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: "#c084fc" }}>Document: {template.title}</p>
      {template.description && (
        <p className="muted" style={{ margin: "4px 0 0" }}>
          {template.description}
        </p>
      )}
    </div>
  );
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

        <TemplateSummary template={template} />

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

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          {template.fields.map((field) => (
            <EvaluationField
              key={field.id}
              field={field}
              value={responses[field.id]}
              onChange={(value) => updateResponse(field.id, value)}
            />
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
