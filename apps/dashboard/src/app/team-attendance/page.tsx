import { redirect } from "next/navigation";
import { hasAccess, hasPermission } from "../../lib/rbac";
import { requireCurrentUser } from "../../lib/session";
import { TeamAttendanceHeader } from "./_components/team-attendance-header";
import { TeamAttendanceMetrics } from "./_components/team-attendance-metrics";
import { TeamAttendanceTable } from "./_components/team-attendance-table";
import { getTeamAttendanceData } from "./queries";

export const dynamic = "force-dynamic";

export default async function TeamAttendancePage() {
  const user = await requireCurrentUser();
  if (!hasAccess(user, ["team_attendance", "company_attendance"])) redirect("/");
  const data = await getTeamAttendanceData(
    user.employeeId,
    hasPermission(user, "company_attendance"),
    user.organizationId
  );
  return (
    <main className="app-shell">
      <TeamAttendanceHeader dateText={data.dateText} dayNote={data.dayNote} />
      <TeamAttendanceMetrics metrics={data.metrics} />
      <TeamAttendanceTable rows={data.rows} />
    </main>
  );
}
