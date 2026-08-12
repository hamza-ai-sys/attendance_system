import { UnauthorizedView } from "../../components/UnauthorizedView";
import { RequestReviewHeader } from "../../components/request-review-header";
import { RequestSummary } from "../../components/request-summary";
import { hasPermission } from "../../lib/rbac";
import { requireCurrentUser } from "../../lib/session";
import { AttendanceRequestList } from "./_components/attendance-request-list";
import { getEmployeeAttendanceCorrectionRequests } from "./queries";

export const dynamic = "force-dynamic";

export default async function EmployeeAttendanceCorrectionRequestsPage() {
  const user = await requireCurrentUser();

  if (!hasPermission(user, "approvals"))
    return <UnauthorizedView featureName="Employee Attendance Correction Requests" />;

  const requests = await getEmployeeAttendanceCorrectionRequests(user);
  const pending = requests.filter(
    ({ status }) => status === "PENDING_MANAGER" || status === "PENDING_HR"
  ).length;
  const approved = requests.filter(({ status }) => status === "APPROVED").length;

  return (
    <main className="app-shell">
      <RequestReviewHeader
        title="Employee Attendance Correction Requests"
        description="Review missing-punch corrections."
        reviewerName={user.fullName}
      />
      <RequestSummary pending={pending} approved={approved} total={requests.length} />
      <AttendanceRequestList
        requests={requests}
        reviewerId={user.employeeId}
        reviewerRole={user.roleName}
      />
    </main>
  );
}
