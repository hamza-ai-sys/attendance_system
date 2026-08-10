"use client";

import { useState } from "react";
import { approveRequest, rejectRequest } from "../../my-attendance-correction-requests/actions";
import type { AttendanceDecisionFeedback } from "../types";

type AttendanceRequestActionsProps = {
  requestId: string;
  status: string;
  isSelfRequest: boolean;
};

const buttonStyle = { padding: "6px 14px", borderRadius: "8px", fontWeight: 600 };

export function AttendanceRequestActions({
  requestId,
  status,
  isSelfRequest
}: AttendanceRequestActionsProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<AttendanceDecisionFeedback | null>(null);

  const decide = async (decision: "approve" | "reject") => {
    setLoading(true);
    setFeedback(null);
    try {
      const action = decision === "approve" ? approveRequest : rejectRequest;
      setFeedback(await action(requestId));
    } catch (error) {
      setFeedback({ error: error instanceof Error ? error.message : `${decision} failed` });
    } finally {
      setLoading(false);
    }
  };

  if (isSelfRequest) return <span className="muted">Own Application</span>;
  if (status === "APPROVED" || status === "REJECTED") return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
      {feedback?.error && <span style={{ color: "#f87171" }}>⚠️ {feedback.error}</span>}
      {feedback?.success && <span style={{ color: "#4ade80" }}>✅ {feedback.success}</span>}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          disabled={loading}
          onClick={() => void decide("reject")}
          style={buttonStyle}
        >
          Reject
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void decide("approve")}
          className="btn-primary"
        >
          Approve
        </button>
      </div>
    </div>
  );
}
