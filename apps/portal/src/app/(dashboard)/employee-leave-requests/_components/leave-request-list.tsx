import { RequestStatusBadge } from "../../../../components/request-status-badge";
import { LeaveRequestActions } from "./leave-request-actions";
import type { EmployeeLeaveRequest } from "../types";

type LeaveRequestListProps = {
  requests: EmployeeLeaveRequest[];
  reviewerId: string;
  reviewerRole: string;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function LeaveRequestRow({
  request,
  reviewerId,
  reviewerRole
}: {
  request: EmployeeLeaveRequest;
  reviewerId: string;
  reviewerRole: string;
}) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ padding: "14px 16px" }}>
        <strong>{request.employee.fullName}</strong>
        <div className="muted">{request.employee.email}</div>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <strong style={{ color: "#60a5fa" }}>{request.leaveType.name}</strong>
        <div className="muted">{request.leaveType.isPaid ? "Paid Leave" : "Unpaid (LOP)"}</div>
      </td>
      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
        {formatDate(request.startDate)} – {formatDate(request.endDate)}
        <div className="muted">{request.totalDays} working day(s)</div>
        {(request.unpaidDays ?? 0) > 0 && (
          <div style={{ color: "#fbbf24" }}>
            {request.paidDays} Paid + {request.unpaidDays} Unpaid
          </div>
        )}
      </td>
      <td style={{ padding: "14px 16px" }}>{request.reason}</td>
      <td style={{ padding: "14px 16px" }}>
        <RequestStatusBadge
          status={request.status}
          reviewerRole={reviewerRole}
          requesterRole={request.employee.role?.name}
        />
      </td>
      <td style={{ padding: "14px 16px", textAlign: "right" }}>
        <LeaveRequestActions
          requestId={request.id}
          status={request.status}
          isSelfRequest={request.employeeId === reviewerId}
          hasExcessUnpaid={(request.unpaidDays ?? 0) > 0}
        />
      </td>
    </tr>
  );
}

export function LeaveRequestList({ requests, reviewerId, reviewerRole }: LeaveRequestListProps) {
  if (requests.length === 0) {
    return (
      <section className="panel">
        <p className="muted">No employee leave requests found.</p>
      </section>
    );
  }

  return (
    <section className="panel" style={{ cursor: "default", display: "block", overflowX: "auto" }}>
      <h2>Employee Leave Requests ({requests.length})</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Leave Category</th>
            <th>Date Range</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <LeaveRequestRow
              key={request.id}
              request={request}
              reviewerId={reviewerId}
              reviewerRole={reviewerRole}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}
