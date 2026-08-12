import { getPendingHRStatusText } from "../../../lib/rbac";
import { deleteManualRequest } from "../actions";
import type { getManualRequests } from "../queries";

type Request = Awaited<ReturnType<typeof getManualRequests>>[number];

function formatTimestamp(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function getStatus(request: Request, roleName: string) {
  if (request.status === "PENDING_MANAGER")
    return { text: "Stage 1: Awaiting Manager", color: "#fbbf24" };
  if (request.status === "PENDING_HR")
    return {
      text: getPendingHRStatusText(roleName, request.employee?.role?.name),
      color: "#c084fc"
    };
  if (request.status === "APPROVED") return { text: "Approved", color: "#4ade80" };
  if (request.status === "REJECTED") return { text: "Rejected", color: "#f87171" };
  return { text: request.status.replace("_", " "), color: "#94a3b8" };
}

function ManualRequestRow({ request, roleName }: { request: Request; roleName: string }) {
  const status = getStatus(request, roleName);
  return (
    <tr>
      <td style={{ color: "#93c5fd", fontWeight: 600 }}>
        {formatTimestamp(request.requestedTimestamp)}
      </td>
      <td>{request.reason}</td>
      <td className="muted" style={{ fontSize: "0.85rem" }}>
        {formatTimestamp(request.createdAt)}
      </td>
      <td>
        <span
          style={{
            background: `${status.color}26`,
            color: status.color,
            border: `1px solid ${status.color}4d`,
            padding: "4px 12px",
            borderRadius: 12,
            fontSize: "0.8rem",
            fontWeight: 600
          }}
        >
          {status.text}
        </span>
      </td>
      <td style={{ textAlign: "right" }}>
        <form action={deleteManualRequest}>
          <input type="hidden" name="id" value={request.id} />
          <button
            type="submit"
            style={{
              background: "rgba(248,113,113,.15)",
              color: "#f87171",
              border: "1px solid rgba(248,113,113,.3)",
              padding: "4px 10px",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Delete
          </button>
        </form>
      </td>
    </tr>
  );
}

export function ManualRequestsTable({
  requests,
  roleName
}: {
  requests: Request[];
  roleName: string;
}) {
  return (
    <section className="form-panel" style={{ gap: 16 }}>
      <div>
        <h2>My Submitted Corrections ({requests.length})</h2>
        <p className="muted">
          Track the status of manual punch adjustment requests you have submitted.
        </p>
      </div>
      <div className="attendance-table-container">
        <table className="directory-table">
          <thead>
            <tr>
              <th>Requested Punch Time</th>
              <th>Reason</th>
              <th>Submitted On</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length ? (
              requests.map((request) => (
                <ManualRequestRow key={request.id} request={request} roleName={roleName} />
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--muted)" }}>
                  You have not submitted any manual requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
