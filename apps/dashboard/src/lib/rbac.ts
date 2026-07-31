import type { SessionUser } from "./session";

export type Permission =
  | "my_attendance"
  | "manual_reports"
  | "team_attendance"
  | "approvals"
  | "enrollment"
  | "reports"
  | "company_attendance";

export function hasPermission(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false;
  if (user.roleName === "owner") {
    if (permission === "my_attendance" || permission === "manual_reports") {
      return false;
    }
    return true;
  }
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: SessionUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.some((p) => hasPermission(user, p));
}

export function hasAllPermissions(user: SessionUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.every((p) => hasPermission(user, p));
}

export function getPendingHRStatusText(
  userRole: string | null | undefined,
  requesterRole: string | null | undefined,
  isLeaveRequest?: boolean
): string {
  const normUserRole = userRole?.toLowerCase();
  const normReqRole = requesterRole?.toLowerCase();

  if (isLeaveRequest) {
    return normUserRole === "hr" || normUserRole === "owner"
      ? "Pending Owner Approval"
      : "Pending HR Approval";
  }

  return normReqRole === "hr" || normUserRole === "owner"
    ? "Pending Owner Approval"
    : "Stage 2: Awaiting HR Approval";
}
