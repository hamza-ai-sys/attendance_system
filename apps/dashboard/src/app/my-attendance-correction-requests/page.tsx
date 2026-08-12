import { redirect } from "next/navigation";
import { hasPermission } from "../../lib/rbac";
import { requireCurrentUser } from "../../lib/session";
import { ManualRequestsHeader } from "./_components/manual-requests-header";
import { ManualRequestsTable } from "./_components/manual-requests-table";
import { ManualRequestsContainer } from "./manual-requests-container";
import { getManualRequests } from "./queries";

export const dynamic = "force-dynamic";

export default async function ManualRequestsPage() {
  const user = await requireCurrentUser();
  if (!hasPermission(user, "manual_reports")) redirect("/");
  const requests = await getManualRequests(user.employeeId, user.userAccountId);

  return (
    <main className="app-shell">
      <ManualRequestsHeader fullName={user.fullName} roleName={user.roleName} />
      <section>
        <ManualRequestsContainer />
      </section>
      <ManualRequestsTable requests={requests} roleName={user.roleName} />
    </main>
  );
}
