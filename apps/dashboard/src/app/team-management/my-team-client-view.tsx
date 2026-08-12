"use client";

import { useState } from "react";
import { TeamPerformanceEvaluationModal } from "../../components/team-performance-evaluation-modal";
import { TeamNotesModal } from "../team-attendance/team-notes-modal";
import { ActiveTemplateBanner } from "./_components/active-template-banner";
import { TeamMemberList } from "./_components/team-member-list";
import type { ActivePerformanceTemplate, TeamMemberSummary } from "./types";

export function MyTeamClientView({
  members,
  activeTemplate
}: {
  members: TeamMemberSummary[];
  activeTemplate: ActivePerformanceTemplate | null;
  currentUserId: string;
}) {
  const [notesEmployee, setNotesEmployee] = useState<TeamMemberSummary | null>(null);
  const [evaluationEmployee, setEvaluationEmployee] = useState<TeamMemberSummary | null>(null);
  return (
    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      {activeTemplate && <ActiveTemplateBanner template={activeTemplate} />}
      <TeamMemberList
        members={members}
        canEvaluate={Boolean(activeTemplate)}
        onNotes={setNotesEmployee}
        onEvaluate={setEvaluationEmployee}
      />
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
