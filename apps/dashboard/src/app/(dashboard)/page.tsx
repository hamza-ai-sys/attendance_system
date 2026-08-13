import { requireCurrentUser } from "../../lib/session";
import { DashboardModuleGrid } from "./_components/dashboard-module-grid";
import { getAllowedDashboardModules } from "./_lib/dashboard-modules";
import { getDashboardCounts } from "./_lib/dashboard-queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireCurrentUser();
  const modules = getAllowedDashboardModules(user);
  const counts = await getDashboardCounts(user);

  return (
    <main className="app-shell">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-welcome-label">Overview</span>
          <h2>Welcome back, {user.fullName}</h2>
          <p className="muted">Choose a workspace to continue managing attendance.</p>
        </div>
        <span className="dashboard-role-badge">{user.roleName}</span>
      </section>
      <DashboardModuleGrid counts={counts} modules={modules} />
    </main>
  );
}
