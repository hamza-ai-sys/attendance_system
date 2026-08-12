import type { CompanyAttendanceMetrics } from "../types";

type AttendanceMetricCardsProps = {
  activeDevicesCount: number;
  metrics: CompanyAttendanceMetrics;
  scanCount: number;
  selectedEmployeeName?: string;
};

export function AttendanceMetricCards({
  activeDevicesCount,
  metrics,
  scanCount,
  selectedEmployeeName
}: AttendanceMetricCardsProps) {
  const attendanceDetail = selectedEmployeeName
    ? `${selectedEmployeeName} ${metrics.presentCount > 0 ? "Present" : "Absent"}`
    : `${metrics.presentCount} of ${metrics.targetEmployeeCount} active staff present`;
  const scanDetail = selectedEmployeeName
    ? `Scans by ${selectedEmployeeName}`
    : "Total scan events recorded in period";

  const cards = [
    {
      label: selectedEmployeeName ? "Attendance Status" : "Organization Attendance",
      value: `${metrics.attendanceRatePercentage}%`,
      detail: attendanceDetail,
      color: "#60a5fa"
    },
    {
      label: "Punctuality Rate",
      value: `${metrics.punctualityRatePercentage}%`,
      detail: `${metrics.onTimeCount} checked in before 09:15 AM`,
      color: "#4ade80"
    },
    { label: "Period Terminal Scans", value: scanCount, detail: scanDetail, color: "#c084fc" },
    {
      label: "Active Terminals",
      value: activeDevicesCount,
      detail: "Connected hardware devices",
      color: "#facc15"
    }
  ];

  return (
    <section
      className="panel-grid"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
    >
      {cards.map((card) => (
        <article key={card.label} className="panel" style={{ cursor: "default", padding: "24px" }}>
          <p className="muted" style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
            {card.label}
          </p>
          <h2 style={{ fontSize: "2.5rem", margin: "8px 0 0", color: card.color }}>{card.value}</h2>
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: "4px" }}>
            {card.detail}
          </p>
        </article>
      ))}
    </section>
  );
}
