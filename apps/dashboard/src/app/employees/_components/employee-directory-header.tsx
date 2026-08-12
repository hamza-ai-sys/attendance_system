const displayedRoles = [
  { name: "owner", label: "Owner" },
  { name: "hr", label: "HR" },
  { name: "manager", label: "Manager" },
  { name: "employee", label: "Employee" }
] as const;

export function EmployeeDirectoryHeader({
  employeeCount,
  roleCounts
}: {
  employeeCount: number;
  roleCounts: Record<string, number>;
}) {
  return (
    <div
      style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}
    >
      <div>
        <h2>All Employees ({employeeCount})</h2>
        <p className="muted">Complete directory of registered staff.</p>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {displayedRoles.map(({ name, label }) => (
          <span key={name} className={`role-badge ${name}`}>
            {label}: {roleCounts[name] || 0}
          </span>
        ))}
      </div>
    </div>
  );
}
