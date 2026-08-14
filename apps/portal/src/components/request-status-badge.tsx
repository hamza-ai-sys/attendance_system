import { getPendingHRStatusText } from "../lib/rbac";

type RequestStatusBadgeProps = {
  status: string;
  reviewerRole: string;
  requesterRole?: string | null;
};

const colors = {
  PENDING_MANAGER: ["rgba(251, 191, 36, 0.15)", "#fbbf24", "rgba(251, 191, 36, 0.3)"],
  PENDING_HR: ["rgba(192, 132, 252, 0.15)", "#c084fc", "rgba(192, 132, 252, 0.3)"],
  APPROVED: ["rgba(74, 222, 128, 0.15)", "#4ade80", "rgba(74, 222, 128, 0.3)"],
  REJECTED: ["rgba(248, 113, 113, 0.15)", "#f87171", "rgba(248, 113, 113, 0.3)"]
} as const;

function getLabel(status: string, reviewerRole: string, requesterRole?: string | null) {
  if (status === "PENDING_MANAGER") return "Stage 1: Awaiting Manager";
  if (status === "PENDING_HR") return getPendingHRStatusText(reviewerRole, requesterRole);
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  return status;
}

export function RequestStatusBadge({
  status,
  reviewerRole,
  requesterRole
}: RequestStatusBadgeProps) {
  const statusColors = colors[status as keyof typeof colors];
  if (!statusColors) return <span>{status}</span>;

  const [background, color, borderColor] = statusColors;
  return (
    <span
      style={{
        background,
        color,
        border: `1px solid ${borderColor}`,
        padding: "6px 12px",
        borderRadius: "12px",
        fontSize: "0.8rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        display: "inline-block"
      }}
    >
      {getLabel(status, reviewerRole, requesterRole)}
    </span>
  );
}
