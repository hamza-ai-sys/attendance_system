import type { TeamAttendanceData } from "../types";

const cards = [
  { key: "total", label: "Total Team", color: "#60a5fa" },
  { key: "present", label: "Present Today", color: "#4ade80" },
  { key: "late", label: "Late Arrivals", color: "#fbbf24" },
  { key: "absent", label: "Absent / No Punch", color: "#f87171" },
  { key: "exempt", label: "Exempt / Off Day", color: "#c084fc" }
] as const;

export function TeamAttendanceMetrics({ metrics }: { metrics: TeamAttendanceData["metrics"] }) {
  return (
    <section
      className="panel-grid"
      style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}
    >
      {cards.map((card) => (
        <article
          key={card.key}
          className="panel"
          style={{ cursor: "default", padding: "20px 24px" }}
        >
          <p className="muted" style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
            {card.label}
          </p>
          <h2 style={{ fontSize: "2.2rem", margin: "8px 0 0", color: card.color }}>
            {metrics[card.key]}
          </h2>
        </article>
      ))}
    </section>
  );
}
