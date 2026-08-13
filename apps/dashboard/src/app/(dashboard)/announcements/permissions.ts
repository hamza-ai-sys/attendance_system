import type { getCurrentUser } from "../../../lib/session";
import { hasPermission } from "../../../lib/rbac";

export function canManageAnnouncements(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return false;
  const role = user.roleName?.toLowerCase();
  return hasPermission(user, "announcements_manage") || role === "hr" || role === "owner";
}
