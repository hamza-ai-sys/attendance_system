import { requireCurrentUser } from "../lib/session";
import { DashboardHeader } from "./_components/dashboard-header";
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
      <DashboardHeader fullName={user.fullName} roleName={user.roleName} />
      <DashboardModuleGrid counts={counts} modules={modules} />
    </main>
  );
}
