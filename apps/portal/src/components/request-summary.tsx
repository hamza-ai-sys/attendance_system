type RequestSummaryProps = {
  approved: number;
  pending: number;
  total: number;
};

const cards = [
  { key: "pending", label: "Pending", color: "#fbbf24" },
  { key: "approved", label: "Approved", color: "#4ade80" },
  { key: "total", label: "Total History", color: "#60a5fa" }
] as const;

export function RequestSummary(props: RequestSummaryProps) {
  return (
    <section className="panel-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
      {cards.map(({ key, label, color }) => (
        <article key={key} className="panel" style={{ cursor: "default", padding: "20px 24px" }}>
          <p className="muted" style={{ textTransform: "uppercase", fontSize: "0.85rem" }}>
            {label}
          </p>
          <h2 style={{ color, fontSize: "2.2rem", margin: "8px 0 0" }}>{props[key]}</h2>
        </article>
      ))}
    </section>
  );
}
