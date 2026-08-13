export function RoleBreakdown({
  breakdown,
  total
}: {
  breakdown: Record<string, number>;
  total: number;
}) {
  return (
    <section className="panel" style={{ cursor: "default" }}>
      <h2>Staff Structure by Role</h2>
      <p className="muted" style={{ marginBottom: "20px" }}>
        Headcount breakdown across organization roles
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {Object.entries(breakdown).map(([role, count]) => {
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={role}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ textTransform: "capitalize", fontWeight: 500 }}>{role}</span>
                <span className="muted">
                  {count} members ({percentage}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)" }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #60a5fa, #c084fc)"
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
