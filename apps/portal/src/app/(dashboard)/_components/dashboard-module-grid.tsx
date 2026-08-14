import Link from "next/link";
import type { DashboardModule } from "../_lib/dashboard-modules";

type DashboardCounts = {
  pendingAttendance: number;
  pendingLeave: number;
  unreadAnnouncements: number;
};

function ModuleBadge({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <span
      style={{
        background: "rgba(251,191,36,.2)",
        color: "#fbbf24",
        padding: "4px 10px",
        borderRadius: "12px"
      }}
    >
      {count} {label}
    </span>
  );
}

function DashboardModuleCard({
  counts,
  module
}: {
  counts: DashboardCounts;
  module: DashboardModule;
}) {
  const count =
    module.href === "/employee-leave-requests"
      ? counts.pendingLeave
      : module.href === "/employee-attendance-correction-requests"
        ? counts.pendingAttendance
        : module.href === "/announcements"
          ? counts.unreadAnnouncements
          : 0;
  const label = module.href === "/announcements" ? "New" : "Pending";

  return (
    <Link href={module.href} style={{ display: "contents" }}>
      <article className="panel">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>{module.name}</h2>
          <ModuleBadge count={count} label={label} />
        </div>
        <p className="muted">{module.description}</p>
      </article>
    </Link>
  );
}

export function DashboardModuleGrid({
  counts,
  modules
}: {
  counts: DashboardCounts;
  modules: DashboardModule[];
}) {
  return (
    <section className="panel-grid" aria-label="Portal workspaces">
      {modules.length === 0 && (
        <p className="muted">You do not have permission to view any modules.</p>
      )}
      {modules.map((module) => (
        <DashboardModuleCard key={module.name} counts={counts} module={module} />
      ))}
    </section>
  );
}
