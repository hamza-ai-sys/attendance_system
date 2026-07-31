"use client";

import { useState } from "react";
import { approveLeaveRequestAction, rejectLeaveRequestAction } from "../leave-requests/approval-actions";

export function LeaveApprovalActionsClient({
  requestId,
  status,
  isSelfRequest = false,
  hasExcessUnpaid = false
}: {
  requestId: string;
  status: string;
  isSelfRequest?: boolean;
  hasExcessUnpaid?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; success?: boolean } | null>(null);

  if (isSelfRequest) {
    return (
      <span className="muted" style={{ fontSize: "0.8rem", fontStyle: "italic", whiteSpace: "nowrap" }}>
        Own Application
      </span>
    );
  }

  const handleApprove = async (overrideAllPaid: boolean = false) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await approveLeaveRequestAction(requestId, overrideAllPaid);
      if (res?.error) {
        setFeedback({ error: res.error });
      } else {
        setFeedback({ success: true });
      }
    } catch (err) {
      setFeedback({ error: err instanceof Error ? err.message : "Approval failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await rejectLeaveRequestAction(requestId);
      if (res?.error) {
        setFeedback({ error: res.error });
      } else {
        setFeedback({ success: true });
      }
    } catch (err) {
      setFeedback({ error: err instanceof Error ? err.message : "Rejection failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
      {feedback?.error && (
        <span style={{ color: "#f87171", fontSize: "0.8rem", fontWeight: 500 }}>
          ⚠️ {feedback.error}
        </span>
      )}
      {feedback?.success && (
        <span style={{ color: "#4ade80", fontSize: "0.8rem", fontWeight: 500 }}>
          ✅ Processed
        </span>
      )}

      {status !== "APPROVED" && status !== "REJECTED" && status !== "CANCELLED" && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="button"
            disabled={loading}
            onClick={handleReject}
            style={{
              background: "rgba(248, 113, 113, 0.15)",
              color: "#f87171",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            Reject
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleApprove(false)}
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              border: "none",
              padding: "6px 16px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            Approve Leave
          </button>

          {hasExcessUnpaid && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleApprove(true)}
              title="HR Override: Approve the entire duration as fully Paid Leave"
              style={{
                background: "rgba(96, 165, 250, 0.15)",
                color: "#60a5fa",
                border: "1px solid rgba(96, 165, 250, 0.3)",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              Approve All as Paid
            </button>
          )}
        </div>
      )}
    </div>
  );
}
