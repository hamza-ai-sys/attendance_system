import { hasAccess, hasPermission } from "../../../lib/rbac";
import type { SessionUser } from "../../../lib/session";

export function canViewEmployees(user: SessionUser): boolean {
  return hasAccess(user, ["enrollment", "company_attendance"]);
}

export function canCreateEmployees(user: SessionUser): boolean {
  return hasPermission(user, "enrollment");
}
