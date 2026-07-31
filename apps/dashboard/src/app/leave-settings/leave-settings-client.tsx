"use client";

import { useState } from "react";
import { createLeaveType, toggleLeaveTypeStatus } from "./actions";

interface LeaveTypeItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  accrualFrequency: "MONTHLY" | "ANNUALLY";
  defaultAllocation: number;
  allowCarryForward: boolean;
  maxCarryForwardDays: number;
  isPaid: boolean;
  isActive: boolean;
}

export function LeaveSettingsClient({ leaveTypes }: { leaveTypes: LeaveTypeItem[] }) {
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createLeaveType(formData);

    setLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setShowModal(false);
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    await toggleLeaveTypeStatus(id, !currentActive);
  }

  return (
    <section className="panel" style={{ cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2>Organization Leave Categories ({leaveTypes.length})</h2>
          <p className="muted">Define leave structures, default quotas, and accrual frequencies for your employees.</p>
        </div>
        <button
          type="button"
          onClick={() => { setErrorMsg(null); setShowModal(true); }}
          style={{
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          + Add Custom Leave Type
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>
              <th style={{ padding: "12px 16px" }}>Leave Name / Code</th>
              <th style={{ padding: "12px 16px" }}>Accrual Frequency</th>
              <th style={{ padding: "12px 16px" }}>Default Quota</th>
              <th style={{ padding: "12px 16px" }}>Carry Forward</th>
              <th style={{ padding: "12px 16px" }}>Pay Status</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.map((lt) => (
              <tr key={lt.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "14px 16px" }}>
                  <strong>{lt.name}</strong>
                  <div className="muted" style={{ fontSize: "0.8rem" }}>Code: <code>{lt.code}</code></div>
                  {lt.description && <div className="muted" style={{ fontSize: "0.8rem", marginTop: "2px" }}>{lt.description}</div>}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    background: lt.accrualFrequency === "MONTHLY" ? "rgba(96, 165, 250, 0.15)" : "rgba(192, 132, 252, 0.15)",
                    color: lt.accrualFrequency === "MONTHLY" ? "#60a5fa" : "#c084fc"
                  }}>
                    {lt.accrualFrequency}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                  {lt.defaultAllocation} days / {lt.accrualFrequency === "MONTHLY" ? "month" : "yr"}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {lt.allowCarryForward ? (
                    <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>Max {lt.maxCarryForwardDays} days</span>
                  ) : (
                    <span className="muted" style={{ fontSize: "0.85rem" }}>Disabled</span>
                  )}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {lt.isPaid ? (
                    <span style={{ color: "#60a5fa", fontWeight: 600, fontSize: "0.85rem" }}>Paid</span>
                  ) : (
                    <span style={{ color: "#f87171", fontWeight: 600, fontSize: "0.85rem" }}>Unpaid (LOP)</span>
                  )}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {lt.isActive ? (
                    <span style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.85rem" }}>Active</span>
                  ) : (
                    <span className="muted" style={{ fontSize: "0.85rem" }}>Inactive</span>
                  )}
                </td>
                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => handleToggle(lt.id, lt.isActive)}
                    style={{
                      background: lt.isActive ? "rgba(248, 113, 113, 0.15)" : "rgba(74, 222, 128, 0.15)",
                      color: lt.isActive ? "#f87171" : "#4ade80",
                      border: `1px solid ${lt.isActive ? "rgba(248, 113, 113, 0.3)" : "rgba(74, 222, 128, 0.3)"}`,
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "0.8rem",
                      cursor: "pointer"
                    }}
                  >
                    {lt.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Custom Leave Type Modal */}
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
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.3rem" }}>Add Custom Leave Category</h3>

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

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Study Leave, Paternity Leave"
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
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Category Code *</label>
                <input
                  type="text"
                  name="code"
                  required
                  placeholder="e.g. STUDY_LEAVE"
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
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Short description of this leave policy"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Accrual Frequency</label>
                  <select
                    name="accrualFrequency"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      background: "#1e293b",
                      border: "1px solid var(--border)",
                      color: "#ffffff"
                    }}
                  >
                    <option value="MONTHLY">Monthly Accrual</option>
                    <option value="ANNUALLY">Annual Allotment</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Annual Quota (Days)</label>
                  <input
                    type="number"
                    name="defaultAllocation"
                    step="0.5"
                    min="0"
                    defaultValue="10"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Allow Carry Forward?</label>
                  <select
                    name="allowCarryForward"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      background: "#1e293b",
                      border: "1px solid var(--border)",
                      color: "#ffffff"
                    }}
                  >
                    <option value="false">No (Expires annually)</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Max Carry Days</label>
                  <input
                    type="number"
                    name="maxCarryForwardDays"
                    step="1"
                    min="0"
                    defaultValue="0"
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

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", color: "var(--muted)" }}>Pay Type</label>
                <select
                  name="isPaid"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "#1e293b",
                    border: "1px solid var(--border)",
                    color: "#ffffff"
                  }}
                >
                  <option value="true">Paid Leave</option>
                  <option value="false">Unpaid Leave (LOP)</option>
                </select>
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
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? "Creating..." : "Save Leave Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
