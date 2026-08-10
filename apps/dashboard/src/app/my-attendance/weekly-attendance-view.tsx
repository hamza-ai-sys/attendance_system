"use client";

import { useState } from "react";
import type { TaggedScan } from "@attendance/attendance-core";
import { ManualRequestModal } from "../my-attendance-correction-requests/manual-request-modal";

export type DisplayScan = TaggedScan<{
  id: string;
  timeStr: string;
  occurredAt: Date;
}>;

export interface WeekdayData {
  dayName: string;
  dateStr: string;
  fullDate: Date;
  scans: DisplayScan[];
  status?: "PRESENT" | "HALF_DAY" | "LATE" | "ABSENT" | "HOLIDAY" | "WEEKEND" | "APPROVED_LEAVE" | "PENDING_LEAVE";
  holidayName?: string;
  leaveTypeName?: string;
  attendanceValue?: number;
  evaluationReason?: string;
}

interface WeeklyAttendanceViewProps {
  weekdays: WeekdayData[];
}

interface ReviewModalInfo {
  scan: DisplayScan;
  dayName: string;
  dateStr: string;
}

export function WeeklyAttendanceView({ weekdays }: WeeklyAttendanceViewProps) {
  const [activeReviewScan, setActiveReviewScan] = useState<ReviewModalInfo | null>(null);
  const [isManualRequestOpen, setIsManualRequestOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const handleChipClick = (scan: DisplayScan, dayName: string, dateStr: string) => {
    if (scan.type === "needs-review") {
      setActiveReviewScan({ scan, dayName, dateStr });
    }
  };

  const openManualRequest = () => {
    setActiveReviewScan(null);
    setModalKey((prev) => prev + 1);
    setIsManualRequestOpen(true);
  };

  return (
    <>
      <section className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              {weekdays.map((day, idx) => (
                <th key={`${day.dayName}-${day.dateStr}-${idx}`}>
                  <span className="weekday-name">{day.dayName}</span>
                  <span className="weekday-date">{day.dateStr}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekdays.map((day, idx) => (
                <td key={`${day.dayName}-${day.dateStr}-${idx}`}>
                  {day.scans.length > 0 ? (
                    <div className="scans-container">
                      {day.scans.map((scan) => {
                        const isReview = scan.type === "needs-review";
                        const isCheckIn = scan.type === "check-in";

                        return (
                          <div
                            key={scan.id}
                            className={`scan-chip ${scan.type}`}
                            onClick={() => handleChipClick(scan, day.dayName, day.dateStr)}
                            title={
                              isReview
                                ? scan.reviewMessage
                                : `${scan.label} recorded at ${scan.timeStr}`
                            }
                            role={isReview ? "button" : undefined}
                            tabIndex={isReview ? 0 : undefined}
                            onKeyDown={(e) => {
                              if (isReview && (e.key === "Enter" || e.key === " ")) {
                                handleChipClick(scan, day.dayName, day.dateStr);
                              }
                            }}
                          >
                            <span className="scan-icon">
                              {isReview ? "⚠️" : isCheckIn ? "📥" : "📤"}
                            </span>
                            <span>{scan.timeStr}</span>
                          </div>
                        );
                      })}
                      {day.status === "HALF_DAY" && (
                        <div style={{ marginTop: "6px" }}>
                          <span
                            style={{
                              background: "rgba(251, 191, 36, 0.15)",
                              color: "#fbbf24",
                              border: "1px solid rgba(251, 191, 36, 0.3)",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              display: "inline-block"
                            }}
                            title={day.evaluationReason}
                          >
                            🌗 Half Leave (0.5)
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "8px 0" }}>
                      {day.status === "APPROVED_LEAVE" && (
                        <span style={{
                          background: "rgba(74, 222, 128, 0.15)",
                          color: "#4ade80",
                          border: "1px solid rgba(74, 222, 128, 0.3)",
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          display: "inline-block"
                        }}>
                          🌴 Approved Leave ({day.leaveTypeName || "Leave"})
                        </span>
                      )}
                      {day.status === "PENDING_LEAVE" && (
                        <span style={{
                          background: "rgba(251, 191, 36, 0.15)",
                          color: "#fbbf24",
                          border: "1px solid rgba(251, 191, 36, 0.3)",
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          display: "inline-block"
                        }}>
                          ⏳ Pending Leave ({day.leaveTypeName || "Leave"})
                        </span>
                      )}
                      {day.status === "HOLIDAY" && (
                        <span style={{
                          background: "rgba(192, 132, 252, 0.15)",
                          color: "#c084fc",
                          border: "1px solid rgba(192, 132, 252, 0.3)",
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          display: "inline-block"
                        }}>
                          🎉 {day.holidayName || "Official Holiday"}
                        </span>
                      )}
                      {day.status === "WEEKEND" && (
                        <span style={{
                          background: "rgba(148, 163, 184, 0.15)",
                          color: "#94a3b8",
                          border: "1px solid rgba(148, 163, 184, 0.3)",
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          display: "inline-block"
                        }}>
                          🌴 Weekend Off
                        </span>
                      )}
                      {day.status === "ABSENT" && (
                        <span style={{
                          background: "rgba(248, 113, 113, 0.15)",
                          color: "#f87171",
                          border: "1px solid rgba(248, 113, 113, 0.3)",
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          display: "inline-block"
                        }}>
                          ❌ Absent
                        </span>
                      )}
                      {!day.status && <span className="no-scans">No scans</span>}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      {/* Review Modal Pop-up */}
      {activeReviewScan && (
        <div className="modal-overlay" onClick={() => setActiveReviewScan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fca5a5" }}>
                <span>⚠️</span> Scan Review Required
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setActiveReviewScan(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "8px 0" }}>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "10px",
                  padding: "16px",
                  color: "#fca5a5",
                  fontWeight: 500,
                  fontSize: "1rem",
                  lineHeight: "1.5"
                }}
              >
                {activeReviewScan.scan.reviewMessage}
              </div>

              <div className="muted" style={{ fontSize: "0.9rem" }}>
                <p style={{ margin: "4px 0" }}>
                  <strong>Day:</strong> {activeReviewScan.dayName} ({activeReviewScan.dateStr})
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Time:</strong> {activeReviewScan.scan.timeStr}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
              <button
                type="button"
                className="logout-btn"
                onClick={() => setActiveReviewScan(null)}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={openManualRequest}
              >
                + Submit Adjustment Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Request Modal Integration */}
      <ManualRequestModal
        key={modalKey}
        isOpen={isManualRequestOpen}
        onClose={() => setIsManualRequestOpen(false)}
      />
    </>
  );
}
