import type { TeamAttendanceRow, TeamAttendanceStatus } from "../types";

const statusStyles: Record<TeamAttendanceStatus, { label: string; color: string }> = {
  PRESENT: { label: "Present", color: "#4ade80" },
  LATE: { label: "Late", color: "#fbbf24" },
  ABSENT: { label: "Absent", color: "#f87171" },
  HOLIDAY: { label: "Holiday", color: "#c084fc" },
  WEEKEND: { label: "Weekend Off", color: "#94a3b8" }
};

function AttendanceRow({ row }: { row: TeamAttendanceRow }) {
  const status = statusStyles[row.status];
  return (
    <tr>
      <td>
        <strong>{row.fullName}</strong>
        <div className="muted">{row.email}</div>
      </td>
      <td className="muted">{row.roleName}</td>
      <td>{row.firstIn}</td>
      <td>{row.lastOut}</td>
      <td>{row.scanCount}</td>
      <td>
        <span
          style={{
            background: `${status.color}26`,
            color: status.color,
            border: `1px solid ${status.color}4d`,
            padding: "4px 10px",
            borderRadius: 12,
            fontWeight: 600
          }}
        >
          {status.label}
        </span>
      </td>
    </tr>
  );
}

export function TeamAttendanceTable({ rows }: { rows: TeamAttendanceRow[] }) {
  return (
    <section className="panel" style={{ cursor: "default", display: "block", marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Team Attendance Details</h2>
        <span className="muted">Total: {rows.length} members</span>
      </div>
      {rows.length === 0 ? (
        <p className="muted">No team members found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>First In</th>
                <th>Last Out</th>
                <th>Punches</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <AttendanceRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
