import type { LeaveTypeItem } from "../types";

const cell = { padding: "14px 16px" };

function LeaveTypeRow({ leaveType, onToggle }: { leaveType: LeaveTypeItem; onToggle: () => void }) {
  const monthly = leaveType.accrualFrequency === "MONTHLY";
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={cell}>
        <strong>{leaveType.name}</strong>
        <div className="muted" style={{ fontSize: "0.8rem" }}>
          Code: <code>{leaveType.code}</code>
        </div>
        {leaveType.description && (
          <div className="muted" style={{ fontSize: "0.8rem", marginTop: 2 }}>
            {leaveType.description}
          </div>
        )}
      </td>
      <td style={cell}>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: "0.8rem",
            fontWeight: 600,
            background: monthly ? "rgba(96,165,250,.15)" : "rgba(192,132,252,.15)",
            color: monthly ? "#60a5fa" : "#c084fc"
          }}
        >
          {leaveType.accrualFrequency}
        </span>
      </td>
      <td style={{ ...cell, fontWeight: 600 }}>
        {leaveType.defaultAllocation} days / {monthly ? "month" : "yr"}
      </td>
      <td style={cell}>
        {leaveType.allowCarryForward ? (
          <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>
            Max {leaveType.maxCarryForwardDays} days
          </span>
        ) : (
          <span className="muted">Disabled</span>
        )}
      </td>
      <td style={cell}>
        <span style={{ color: leaveType.isPaid ? "#60a5fa" : "#f87171", fontWeight: 600 }}>
          {leaveType.isPaid ? "Paid" : "Unpaid (LOP)"}
        </span>
      </td>
      <td style={cell}>
        <span
          className={leaveType.isActive ? undefined : "muted"}
          style={leaveType.isActive ? { color: "#4ade80", fontWeight: 600 } : undefined}
        >
          {leaveType.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td style={{ ...cell, textAlign: "right" }}>
        <button
          type="button"
          onClick={onToggle}
          style={{
            background: leaveType.isActive ? "rgba(248,113,113,.15)" : "rgba(74,222,128,.15)",
            color: leaveType.isActive ? "#f87171" : "#4ade80",
            border: "1px solid currentColor",
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer"
          }}
        >
          {leaveType.isActive ? "Deactivate" : "Activate"}
        </button>
      </td>
    </tr>
  );
}

export function LeaveTypesTable({
  leaveTypes,
  onToggle
}: {
  leaveTypes: LeaveTypeItem[];
  onToggle: (leaveType: LeaveTypeItem) => void;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--border)",
              color: "var(--muted)",
              fontSize: "0.85rem",
              textTransform: "uppercase"
            }}
          >
            {[
              "Leave Name / Code",
              "Accrual Frequency",
              "Default Quota",
              "Carry Forward",
              "Pay Status",
              "Status"
            ].map((label) => (
              <th key={label} style={{ padding: "12px 16px" }}>
                {label}
              </th>
            ))}
            <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveTypes.map((leaveType) => (
            <LeaveTypeRow
              key={leaveType.id}
              leaveType={leaveType}
              onToggle={() => onToggle(leaveType)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
