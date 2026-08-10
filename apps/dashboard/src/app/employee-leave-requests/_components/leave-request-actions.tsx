"use client";

import { useState } from "react";
import { approveLeaveRequestAction, rejectLeaveRequestAction } from "../actions";
import type { LeaveDecisionFeedback } from "../types";

type LeaveRequestActionsProps = {
  requestId: string;
  status: string;
  isSelfRequest: boolean;
  hasExcessUnpaid: boolean;
};

export function LeaveRequestActions({
  requestId,
  status,
  isSelfRequest,
  hasExcessUnpaid
}: LeaveRequestActionsProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<LeaveDecisionFeedback | null>(null);

  const approve = async (overrideAllPaid = false) => {
    setLoading(true);
    setFeedback(null);
    try {
      setFeedback(await approveLeaveRequestAction(requestId, overrideAllPaid));
    } catch (error) {
      setFeedback({ error: error instanceof Error ? error.message : "Approval failed" });
    } finally {
      setLoading(false);
    }
  };

  const reject = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      setFeedback(await rejectLeaveRequestAction(requestId));
    } catch (error) {
      setFeedback({ error: error instanceof Error ? error.message : "Rejection failed" });
    } finally {
      setLoading(false);
    }
  };

  if (isSelfRequest) return <span className="muted">Own Application</span>;
  if (["APPROVED", "REJECTED", "CANCELLED"].includes(status)) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
      {feedback?.error && <span style={{ color: "#f87171" }}>⚠️ {feedback.error}</span>}
      {feedback?.success && <span style={{ color: "#4ade80" }}>✅ Processed</span>}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button type="button" disabled={loading} onClick={() => void reject()}>
          Reject
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void approve()}
          className="btn-primary"
        >
          Approve Leave
        </button>
        {hasExcessUnpaid && (
          <button type="button" disabled={loading} onClick={() => void approve(true)}>
            Approve All as Paid
          </button>
        )}
      </div>
    </div>
  );
}
