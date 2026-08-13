import Link from "next/link";
import type { TeamMemberSummary } from "../types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TeamMemberRow({
  member,
  canEvaluate,
  onNotes,
  onEvaluate
}: {
  member: TeamMemberSummary;
  canEvaluate: boolean;
  onNotes: () => void;
  onEvaluate: () => void;
}) {
  return (
    <article
      className="panel"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "default"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#60a5fa,#c084fc)",
            display: "grid",
            placeItems: "center",
            fontWeight: 700
          }}
        >
          {initials(member.fullName)}
        </div>
        <div>
          <strong>{member.fullName}</strong>{" "}
          <span className="note-badge public">{member.roleName}</span>
          <div className="muted">
            {member.email} {member.employeeCode && `• Code: ${member.employeeCode}`}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          className="prominent-notes-icon-btn"
          onClick={onNotes}
          title="Add Employee Note"
        >
          📝
        </button>
        <Link
          href={`/team-management/${member.id}/notes`}
          className="prominent-history-icon-btn"
          title="Previous Notes"
        >
          ↶
        </Link>
        {canEvaluate && (
          <button
            type="button"
            className="prominent-performance-icon-btn"
            onClick={onEvaluate}
            title="Evaluate Performance"
          >
            ✨
          </button>
        )}
      </div>
    </article>
  );
}

export function TeamMemberList({
  members,
  canEvaluate,
  onNotes,
  onEvaluate
}: {
  members: TeamMemberSummary[];
  canEvaluate: boolean;
  onNotes: (member: TeamMemberSummary) => void;
  onEvaluate: (member: TeamMemberSummary) => void;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Team Members</h2>
        <span className="muted">{members.length} members</span>
      </div>
      {members.length ? (
        members.map((member) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            canEvaluate={canEvaluate}
            onNotes={() => onNotes(member)}
            onEvaluate={() => onEvaluate(member)}
          />
        ))
      ) : (
        <p className="muted">No team members found.</p>
      )}
    </section>
  );
}
