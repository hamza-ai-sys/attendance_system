import { redirect } from "next/navigation";
import { requireCurrentUser } from "../../lib/session";
import { LeaveRequestsHeader } from "./_components/leave-requests-header";
import { LeaveRequestsClient } from "./leave-requests-client";
import { getLeaveRequestsPageData } from "./queries";

export const dynamic = "force-dynamic";

export default async function LeaveRequestsPage() {
  const user = await requireCurrentUser();
  if (user.roleName.toLowerCase() === "owner") redirect("/");
  const { balances, activeTypes, requests } = await getLeaveRequestsPageData(user.employeeId);

  return (
    <main className="app-shell">
      <LeaveRequestsHeader fullName={user.fullName} roleName={user.roleName} />
      <LeaveRequestsClient
        balances={balances}
        activeTypes={activeTypes}
        myRequests={requests}
        userRole={user.roleName}
      />
    </main>
  );
}
