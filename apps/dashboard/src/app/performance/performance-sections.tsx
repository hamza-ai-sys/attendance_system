"use client";

import { deletePerformanceTemplate } from "./actions";
import type { EvaluationData, TemplateData } from "./performance-types";

function templateStatus(startDate: string, endDate: string) {
  const now = new Date();
  if (now < new Date(startDate)) return { label: "⏳ Scheduled", color: "#60a5fa" };
  if (now <= new Date(endDate)) return { label: "✨ Active Now", color: "#34d399" };
  return { label: "📁 Expired", color: "#94a3b8" };
}

export function PerformanceTemplateList({ templates }: { templates: TemplateData[] }) {
  const removeTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this performance template?")) return;
    try {
      await deletePerformanceTemplate(id);
    } catch {
      alert("Failed to delete template");
    }
  };

  return (
    <section className="panel" style={{ cursor: "default", display: "block" }}>
      <h2>Performance Templates & Schedule</h2>
      {templates.length === 0 ? (
        <p className="muted">No performance templates defined yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {templates.map((template) => {
            const status = templateStatus(template.startDate, template.endDate);
            return (
              <article key={template.id} className="panel" style={{ cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px" }}>{template.title}</h3>
                    {template.description && <p className="muted">{template.description}</p>}
                  </div>
                  <strong style={{ color: status.color, whiteSpace: "nowrap" }}>{status.label}</strong>
                </div>
                <dl style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", margin: "16px 0" }}>
                  <dt className="muted">Active window</dt>
                  <dd>{new Date(template.startDate).toLocaleDateString()} – {new Date(template.endDate).toLocaleDateString()}</dd>
                  <dt className="muted">Criteria</dt><dd>{template.fields.length} fields</dd>
                  <dt className="muted">Submitted</dt><dd>{template.evaluationCount} responses</dd>
                </dl>
                <button type="button" className="danger-btn" onClick={() => removeTemplate(template.id)}>
                  🗑️ Delete Template
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function PerformanceEvaluationList({
  evaluations,
  onSelect
}: {
  evaluations: EvaluationData[];
  onSelect: (evaluation: EvaluationData) => void;
}) {
  return (
    <section className="panel" style={{ cursor: "default", display: "block" }}>
      <h2>Submitted Manager Evaluations</h2>
      {evaluations.length === 0 ? (
        <p className="muted">No manager evaluations submitted yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Employee</th><th>Evaluator / Manager</th><th>Document</th>
                <th>Score</th><th>Submitted</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation) => (
                <tr key={evaluation.id}>
                  <td><strong>{evaluation.employeeName}</strong><div className="muted">{evaluation.employeeEmail}</div></td>
                  <td>{evaluation.evaluatorName}<div className="muted">{evaluation.evaluatorRole}</div></td>
                  <td>{evaluation.templateTitle}</td>
                  <td>{evaluation.overallScore === null ? "Text Feedback" : `★ ${evaluation.overallScore} / 5`}</td>
                  <td>{new Date(evaluation.submittedAt).toLocaleDateString()}</td>
                  <td><button type="button" className="back-link" onClick={() => onSelect(evaluation)}>View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function PerformanceEvaluationDetails({
  evaluation,
  onClose
}: {
  evaluation: EvaluationData;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Performance Evaluation Details</h2>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>
        <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div><dt className="muted">Employee</dt><dd>{evaluation.employeeName}</dd></div>
          <div><dt className="muted">Evaluator</dt><dd>{evaluation.evaluatorName} ({evaluation.evaluatorRole})</dd></div>
          <div><dt className="muted">Document</dt><dd>{evaluation.templateTitle}</dd></div>
          <div><dt className="muted">Overall score</dt><dd>{evaluation.overallScore === null ? "N/A" : `★ ${evaluation.overallScore} / 5`}</dd></div>
        </dl>
        <h3>Field Responses</h3>
        {Object.entries(evaluation.responses).map(([fieldId, value]) => {
          const field = evaluation.fields.find((candidate) => candidate.id === fieldId);
          return (
            <div key={fieldId} className="panel" style={{ cursor: "default", padding: "12px 16px" }}>
              <strong className="muted">{field?.label ?? fieldId}</strong>
              <div>{field?.type === "rating" ? `★ ${value} / 5` : String(value)}</div>
            </div>
          );
        })}
        {evaluation.comments && <p className="panel">{evaluation.comments}</p>}
      </div>
    </div>
  );
}
