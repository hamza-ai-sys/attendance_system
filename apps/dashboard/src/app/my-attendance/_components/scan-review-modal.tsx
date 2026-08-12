import type { DisplayScan } from "../types";

export interface ReviewModalInfo {
  scan: DisplayScan;
  dayName: string;
  dateStr: string;
}

export function ScanReviewModal({
  info,
  onClose,
  onRequest
}: {
  info: ReviewModalInfo;
  onClose: () => void;
  onRequest: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: "flex", gap: 8, color: "#fca5a5" }}>⚠️ Scan Review Required</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "8px 0" }}>
          <div
            style={{
              background: "rgba(239,68,68,.15)",
              border: "1px solid rgba(239,68,68,.4)",
              borderRadius: 10,
              padding: 16,
              color: "#fca5a5",
              lineHeight: 1.5
            }}
          >
            {info.scan.reviewMessage}
          </div>
          <div className="muted">
            <p>
              <strong>Day:</strong> {info.dayName} ({info.dateStr})
            </p>
            <p>
              <strong>Time:</strong> {info.scan.timeStr}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="button" className="logout-btn" onClick={onClose}>
            Dismiss
          </button>
          <button type="button" className="btn-primary" onClick={onRequest}>
            + Submit Adjustment Request
          </button>
        </div>
      </div>
    </div>
  );
}
