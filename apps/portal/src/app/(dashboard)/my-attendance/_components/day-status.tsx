import type { WeekdayData } from "../types";

const statuses = {
  APPROVED_LEAVE: { color: "#4ade80", icon: "🌴", label: "Approved Leave" },
  PENDING_LEAVE: { color: "#fbbf24", icon: "⏳", label: "Pending Leave" },
  HOLIDAY: { color: "#c084fc", icon: "🎉", label: "Official Holiday" },
  WEEKEND: { color: "#94a3b8", icon: "🌴", label: "Weekend Off" },
  ABSENT: { color: "#f87171", icon: "❌", label: "Absent" }
} as const;

export function DayStatus({ day }: { day: WeekdayData }) {
  if (!day.status || !(day.status in statuses)) return <span className="no-scans">No scans</span>;
  const status = statuses[day.status as keyof typeof statuses];
  const detail = day.status.includes("LEAVE")
    ? day.leaveTypeName
    : day.status === "HOLIDAY"
      ? day.holidayName
      : null;
  return (
    <span
      style={{
        background: `${status.color}26`,
        color: status.color,
        border: `1px solid ${status.color}4d`,
        padding: "6px 12px",
        borderRadius: 12,
        fontSize: "0.8rem",
        fontWeight: 600,
        display: "inline-block"
      }}
    >
      {status.icon} {status.label}
      {detail && ` (${detail})`}
    </span>
  );
}

export function HalfDayStatus({ reason }: { reason?: string }) {
  return (
    <span
      title={reason}
      style={{
        background: "rgba(251,191,36,.15)",
        color: "#fbbf24",
        border: "1px solid rgba(251,191,36,.3)",
        padding: "4px 10px",
        borderRadius: 12,
        fontSize: "0.75rem",
        fontWeight: 600
      }}
    >
      🌗 Half Leave (0.5)
    </span>
  );
}
