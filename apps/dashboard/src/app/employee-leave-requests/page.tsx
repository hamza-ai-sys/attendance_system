import { UnauthorizedView } from "../../components/unauthorized-view";
import { RequestReviewHeader } from "../../components/request-review-header";
import { RequestSummary } from "../../components/request-summary";
import { hasPermission } from "../../lib/rbac";
import { requireCurrentUser } from "../../lib/session";
import { LeaveRequestList } from "./_components/leave-request-list";
import { getEmployeeLeaveRequests } from "./queries";

export const dynamic = "force-dynamic";

export default async function EmployeeLeaveRequestsPage() {
  const user = await requireCurrentUser();

  if (!hasPermission(user, "approvals"))
    return <UnauthorizedView featureName="Employee Leave Requests" />;

  const requests = await getEmployeeLeaveRequests(user);
  const pending = requests.filter(
    ({ status }) => status === "PENDING_MANAGER" || status === "PENDING_HR"
  ).length;
  const approved = requests.filter(({ status }) => status === "APPROVED").length;

  return (
    <main className="app-shell">
      <RequestReviewHeader
        title="Employee Leave Requests"
        description="Review employee time-off requests."
        reviewerName={user.fullName}
      />
      <RequestSummary pending={pending} approved={approved} total={requests.length} />
      <LeaveRequestList
        requests={requests}
        reviewerId={user.employeeId}
        reviewerRole={user.roleName}
      />
    </main>
  );
}
