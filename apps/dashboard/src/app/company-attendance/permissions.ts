import { hasPermission } from "../../lib/rbac";
import type { SessionUser } from "../../lib/session";

export function canViewCompanyAttendance(user: SessionUser): boolean {
  return (
    hasPermission(user, "company_attendance") || user.roleName === "owner" || user.roleName === "hr"
  );
}
