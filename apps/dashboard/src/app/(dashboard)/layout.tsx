import { requireCurrentUser } from "../../lib/session";
import { DashboardShell } from "./_components/dashboard-shell";
import { getAllowedDashboardModules } from "./_lib/dashboard-modules";

export default async function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireCurrentUser();

  return (
    <DashboardShell
      fullName={user.fullName}
      modules={getAllowedDashboardModules(user)}
      roleName={user.roleName}
    >
      {children}
    </DashboardShell>
  );
}
