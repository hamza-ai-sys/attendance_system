"use client";

import { useState } from "react";
import { TeamPerformanceEvaluationModal } from "../../../components/team-performance-evaluation-modal";
import type {
  ActivePerformanceTemplate,
  PerformanceTemplateField,
  TeamMemberSummary
} from "../team-management/types";
import { TeamNotesModal } from "./team-notes-modal";

export type TeamMember = TeamMemberSummary;
export type TemplateField = PerformanceTemplateField;
export type ActiveTemplate = ActivePerformanceTemplate;

interface TeamClientViewProps {
  members: TeamMember[];
  activeTemplate: ActiveTemplate | null;
  currentUserId: string;
}

function TeamMemberCard({
  member,
  canEvaluate,
  onNotes,
  onEvaluate
}: {
  member: TeamMember;
  canEvaluate: boolean;
  onNotes: () => void;
  onEvaluate: () => void;
}) {
  return (
    <article
      className="panel"
      style={{ cursor: "default", display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem" }}>{member.fullName}</h3>
          <span className="note-badge public">{member.roleName}</span>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
          {member.email}
        </p>
        {member.employeeCode && <p className="muted">Code: {member.employeeCode}</p>}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: "auto",
          paddingTop: 12,
          borderTop: "1px solid var(--border)"
        }}
      >
        <button type="button" className="back-link" onClick={onNotes}>
          📝 Employee Notes
        </button>
        {canEvaluate && (
          <button type="button" className="primary-btn" onClick={onEvaluate}>
            ✨ Evaluate Performance
          </button>
        )}
      </div>
    </article>
  );
}

export function TeamClientView({ members, activeTemplate }: TeamClientViewProps) {
  const [notesEmployee, setNotesEmployee] = useState<TeamMember | null>(null);
  const [evaluationEmployee, setEvaluationEmployee] = useState<TeamMember | null>(null);

  return (
    <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {activeTemplate && (
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(236, 72, 153, 0.15))",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            borderRadius: "16px",
            padding: "20px 24px"
          }}
        >
          <h3 style={{ margin: "0 0 6px", color: "#fbbf24" }}>
            ✨ Performance Evaluation Period Active
          </h3>
          <p style={{ margin: 0, color: "#cbd5e1" }}>
            HR Document: <strong>{activeTemplate.title}</strong> (Active:{" "}
            {new Date(activeTemplate.startDate).toLocaleDateString()} to{" "}
            {new Date(activeTemplate.endDate).toLocaleDateString()})
          </p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.3rem", margin: 0 }}>Team Members & Actions</h2>
        <span className="muted">{members.length} members</span>
      </div>

      {members.length === 0 ? (
        <p className="muted">No team members found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px"
          }}
        >
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              canEvaluate={Boolean(activeTemplate)}
              onNotes={() => setNotesEmployee(member)}
              onEvaluate={() => setEvaluationEmployee(member)}
            />
          ))}
        </div>
      )}

      {notesEmployee && (
        <TeamNotesModal employee={notesEmployee} onClose={() => setNotesEmployee(null)} />
      )}
      {evaluationEmployee && activeTemplate && (
        <TeamPerformanceEvaluationModal
          employee={evaluationEmployee}
          template={activeTemplate}
          onClose={() => setEvaluationEmployee(null)}
        />
      )}
    </div>
  );
}
