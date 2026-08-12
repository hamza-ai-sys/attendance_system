import type { LeaveBalanceItem } from "./leave-request-types";

export function LeaveBalanceCards({ balances }: { balances: LeaveBalanceItem[] }) {
  if (balances.length === 0) {
    return <p className="panel muted">No active leave categories defined yet.</p>;
  }

  return (
    <section
      className="stats-grid"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
    >
      {balances.map((balance) => (
        <article key={balance.id} className="stat-card" style={{ cursor: "default" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="stat-label">{balance.leaveTypeName}</span>
            <span className={`note-badge ${balance.isPaid ? "public" : "private"}`}>
              {balance.isPaid ? "Paid" : "Unpaid"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "8px 0" }}>
            <span className="stat-value" style={{ color: "#4ade80" }}>
              {balance.isPaid ? balance.available.toFixed(1) : "∞"}
            </span>
            <span className="muted">days available</span>
          </div>
          <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
            Accrued: <strong>{balance.accrued.toFixed(1)}</strong> · Used: {balance.used} · Carried:{" "}
            {balance.carriedOver}
          </p>
        </article>
      ))}
    </section>
  );
}
