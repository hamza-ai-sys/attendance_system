"use client";

import { useState } from "react";
import { submitLeaveRequest, cancelLeaveRequest } from "./actions";

export interface LeaveBalanceItem {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  isPaid: boolean;
  allocated: number;
  accrued: number;
  used: number;
  carriedOver: number;
  available: number;
}

export interface LeaveTypeOption {
  id: string;
  name: string;
  code: string;
  isPaid: boolean;
}

export interface LeaveRequestItem {
  id: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  startDateStr: string;
  endDateStr: string;
  totalDays: number;
  paidDays?: number | null;
  unpaidDays?: number | null;
  reason: string;
  status: "PENDING_MANAGER" | "PENDING_HR" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string | null;
  createdAtStr: string;
}

export function LeaveRequestsClient({
  balances,
  activeTypes,
  myRequests,
  userRole = "employee"
}: {
  balances: LeaveBalanceItem[];
  activeTypes: LeaveTypeOption[];
  myRequests: LeaveRequestItem[];
  userRole?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "cancelled">("all");

  // Form state for live preview
  const [selectedTypeId, setSelectedTypeId] = useState(activeTypes[0]?.id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredRequests = myRequests.filter((req) => {
    if (statusFilter === "pending") {
      return req.status === "PENDING_MANAGER" || req.status === "PENDING_HR";
    }
    if (statusFilter === "approved") {
      return req.status === "APPROVED";
    }
    if (statusFilter === "cancelled") {
      return req.status === "CANCELLED" || req.status === "REJECTED";
    }
    return true;
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await submitLeaveRequest(formData);

    setLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setShowModal(false);
      setStartDate("");
      setEndDate("");
    }
  }

  async function handleCancel(id: string) {
    if (confirm("Are you sure you want to cancel this leave request?")) {
      await cancelLeaveRequest(id);
    }
  }

  const selectedBalance = balances.find((b) => b.leaveTypeId === selectedTypeId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Leave Balances Summary Cards */}
      {balances.length === 0 ? (
        <div className="panel" style={{ cursor: "default", padding: "20px" }}>
          <p className="muted">No active leave categories defined yet. HR can define custom leave structures in HR Leave Settings.</p>
        </div>
      ) : (
        <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {balances.map((b) => (
          <div key={b.id} className="stat-card" style={{ cursor: "default", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="stat-label">{b.leaveTypeName}</span>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: "4px",
                background: b.isPaid ? "rgba(96, 165, 250, 0.15)" : "rgba(248, 113, 113, 0.15)",
                color: b.isPaid ? "#60a5fa" : "#f87171"
              }}>
                {b.isPaid ? "Paid" : "Unpaid"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "8px 0" }}>
              <span className="stat-value" style={{ color: "#4ade80", fontSize: "2rem" }}>
                {b.isPaid ? b.available.toFixed(1) : "∞"}
              </span>
              <span className="muted" style={{ fontSize: "0.85rem" }}>days available</span>
            </div>
            <div className="muted" style={{ fontSize: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
              Accrued YTD: <strong>{b.accrued.toFixed(1)}</strong> | Used: <strong>{b.used}</strong> | Carried: <strong>{b.carriedOver}</strong>
            </div>
          </div>
        ))}
      </section>
      )}

      {/* 2. Header Action & My Requests Table */}
      <section className="panel" style={{ cursor: "default" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2>My Leave Applications ({filteredRequests.length})</h2>
            <p className="muted">Track your submitted time-off applications and approval stage status.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Status Filter Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label htmlFor="status-filter" className="muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "approved" | "cancelled")}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#f8fafc",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  outline: "none",
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)"
                }}
              >
                <option value="all" style={{ background: "#1e1b4b", color: "#fff" }}>All ({myRequests.length})</option>
                <option value="pending" style={{ background: "#1e1b4b", color: "#fff" }}>Pending Approval</option>
                <option value="approved" style={{ background: "#1e1b4b", color: "#fff" }}>Approved</option>
                <option value="cancelled" style={{ background: "#1e1b4b", color: "#fff" }}>Cancelled / Rejected</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => { setErrorMsg(null); setShowModal(true); }}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              + Apply for Leave
            </button>
          </div>
        </div>

        {myRequests.length === 0 ? (
          <p className="muted" style={{ padding: "20px 0" }}>You have not submitted any leave requests yet.</p>
        ) : filteredRequests.length === 0 ? (
          <p className="muted" style={{ padding: "20px 0" }}>No leave requests found matching the selected status filter.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 16px" }}>Leave Category</th>
                  <th style={{ padding: "12px 16px" }}>Date Range</th>
                  <th style={{ padding: "12px 16px" }}>Total Working Days</th>
                  <th style={{ padding: "12px 16px" }}>Reason</th>
                  <th style={{ padding: "12px 16px" }}>Approval Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                      {req.leaveTypeName}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ color: "#60a5fa", fontWeight: 600 }}>
                        {req.startDateStr} – {req.endDateStr}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600 }}>{req.totalDays} {req.totalDays === 1 ? "day" : "days"}</div>
                      {req.status === "APPROVED" && (req.unpaidDays ?? 0) > 0 && (
                        <div style={{ color: "#fbbf24", fontSize: "0.78rem", fontWeight: 600, marginTop: "2px" }}>
                          ({req.paidDays} Paid / {req.unpaidDays} Unpaid LOP)
                        </div>
                      )}
                      {req.status === "APPROVED" && (req.unpaidDays ?? 0) === 0 && (
                        <div style={{ color: "#4ade80", fontSize: "0.78rem", fontWeight: 600, marginTop: "2px" }}>
                          (Fully Paid Leave)
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "0.9rem" }}>{req.reason}</span>
                      {req.rejectionReason && (
                        <div style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "4px" }}>
                          Rejection note: {req.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      {req.status === "PENDING_MANAGER" && (
                        <span style={{
                          background: "rgba(251, 191, 36, 0.15)",
                          color: "#fbbf24",
                          border: "1px solid rgba(251, 191, 36, 0.3)",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}>
                          Pending Manager
                        </span>
                      )}
                      {req.status === "PENDING_HR" && (
                        <span style={{
                          background: "rgba(192, 132, 252, 0.15)",
                          color: "#c084fc",
                          border: "1px solid rgba(192, 132, 252, 0.3)",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}>
                          {userRole === "hr" || userRole === "owner" ? "Pending Owner Approval" : "Pending HR Approval"}
                        </span>
                      )}
                      {req.status === "APPROVED" && (
                        <span style={{
                          background: "rgba(74, 222, 128, 0.15)",
                          color: "#4ade80",
                          border: "1px solid rgba(74, 222, 128, 0.3)",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}>
                          Approved
                        </span>
                      )}
                      {req.status === "REJECTED" && (
                        <span style={{
                          background: "rgba(248, 113, 113, 0.15)",
                          color: "#f87171",
                          border: "1px solid rgba(248, 113, 113, 0.3)",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}>
                          Rejected
                        </span>
                      )}
                      {req.status === "CANCELLED" && (
                        <span className="muted" style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.8rem"
                        }}>
                          Cancelled
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      {(req.status === "PENDING_MANAGER" || req.status === "PENDING_HR") && (
                        <button
                          type="button"
                          onClick={() => handleCancel(req.id)}
                          style={{
                            background: "rgba(248, 113, 113, 0.15)",
                            color: "#f87171",
                            border: "1px solid rgba(248, 113, 113, 0.3)",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Leave Request Submission Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100
        }}>
          <div style={{
            background: "var(--panel-bg, #1e293b)",
            border: "1px solid var(--border, #334155)",
            borderRadius: "12px",
            padding: "28px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.3rem" }}>Submit Leave Application</h3>

            {errorMsg && (
              <div style={{
                background: "rgba(239,68,68,0.15)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "6px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "0.85rem"
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Leave Category *</label>
                <select
                  name="leaveTypeId"
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "#1e293b",
                    border: "1px solid var(--border)",
                    color: "#ffffff"
                  }}
                >
                  {activeTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.isPaid ? "Paid" : "Unpaid"})
                    </option>
                  ))}
                </select>
                {selectedBalance && selectedBalance.isPaid && (
                  <span className="muted" style={{ fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                    Available balance: <strong>{selectedBalance.available.toFixed(1)} days</strong>
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border)",
                      color: "#ffffff"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border)",
                      color: "#ffffff"
                    }}
                  />
                </div>
              </div>

              {selectedBalance?.isPaid && startDate && endDate && (
                <div style={{
                  background: "rgba(96, 165, 250, 0.1)",
                  border: "1px solid rgba(96, 165, 250, 0.25)",
                  color: "#93c5fd",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "0.82rem"
                }}>
                  ℹ️ <strong>Notice:</strong> If your requested duration exceeds your available paid balance ({selectedBalance.available.toFixed(1)} days), the remaining excess days will automatically be submitted for HR review as Unpaid Leave (Loss of Pay), or HR can choose to approve all days as Paid.
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Reason *</label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  placeholder="Provide details for your leave request..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: "#ffffff",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "6px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
