import { redirect } from "next/navigation";
import { hasPermission } from "../../../lib/rbac";
import { requireCurrentUser } from "../../../lib/session";
import { TeamManagementHeader } from "./_components/team-management-header";
import { MyTeamClientView } from "./my-team-client-view";
import { getTeamManagementData } from "./queries";

export const dynamic = "force-dynamic";

export default async function TeamManagementPage() {
  const user = await requireCurrentUser();
  if (user.roleName.toLowerCase() === "employee" && !hasPermission(user, "my_team")) redirect("/");
  const data = await getTeamManagementData(
    user.employeeId,
    hasPermission(user, "company_attendance"),
    user.organizationId
  );
  return (
    <main className="app-shell">
      <TeamManagementHeader />
      <MyTeamClientView
        members={data.members}
        activeTemplate={data.activeTemplate}
        currentUserId={user.employeeId}
      />
    </main>
  );
}
