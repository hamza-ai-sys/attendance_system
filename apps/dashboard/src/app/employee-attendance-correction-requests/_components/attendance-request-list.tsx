import { RequestStatusBadge } from "../../../components/request-status-badge";
import { AttendanceRequestActions } from "./attendance-request-actions";
import type { EmployeeAttendanceCorrectionRequest } from "../types";

type AttendanceRequestListProps = {
  requests: EmployeeAttendanceCorrectionRequest[];
  reviewerId: string;
  reviewerRole: string;
};

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function AttendanceRequestRow({
  request,
  reviewerId,
  reviewerRole
}: {
  request: EmployeeAttendanceCorrectionRequest;
  reviewerId: string;
  reviewerRole: string;
}) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ padding: "14px 16px" }}>
        <strong>{request.employee.fullName}</strong>
        <div className="muted" style={{ fontSize: "0.85rem" }}>
          {request.employee.email} ({request.employee.role?.name || "employee"})
        </div>
      </td>
      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
        <strong style={{ color: "#60a5fa" }}>
          {request.requestedTimestamp ? formatDateTime(request.requestedTimestamp) : "N/A"}
        </strong>
        <div className="muted">Type: {request.type}</div>
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
        <AttendanceRequestActions
          requestId={request.id}
          status={request.status}
          isSelfRequest={request.employeeId === reviewerId}
        />
      </td>
    </tr>
  );
}

export function AttendanceRequestList({
  requests,
  reviewerId,
  reviewerRole
}: AttendanceRequestListProps) {
  if (requests.length === 0) {
    return (
      <section className="panel">
        <p className="muted">No attendance correction requests found.</p>
      </section>
    );
  }

  return (
    <section className="panel" style={{ cursor: "default", display: "block", overflowX: "auto" }}>
      <h2>Attendance Correction Requests ({requests.length})</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Punch Details</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <AttendanceRequestRow
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
