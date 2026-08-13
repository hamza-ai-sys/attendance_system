import type { DashboardModule } from "./dashboard-modules";

export type NavigationGroup = {
  label: string;
  modules: DashboardModule[];
};

const groupOrder = ["My Work", "Team", "Organization"] as const;

const myWorkRoutes = new Set([
  "/my-attendance",
  "/my-leave-requests",
  "/my-attendance-correction-requests"
]);

const teamRoutes = new Set([
  "/team-attendance",
  "/team-management",
  "/employee-leave-requests",
  "/employee-attendance-correction-requests"
]);

function getGroupLabel(href: string): (typeof groupOrder)[number] {
  if (myWorkRoutes.has(href)) return "My Work";
  if (teamRoutes.has(href)) return "Team";
  return "Organization";
}

export function getNavigationGroups(modules: DashboardModule[]): NavigationGroup[] {
  const visibleModules = modules.filter((module) => module.href !== "/employees/new");

  return groupOrder.flatMap((label) => {
    const groupedModules = visibleModules.filter((module) => getGroupLabel(module.href) === label);
    return groupedModules.length > 0 ? [{ label, modules: groupedModules }] : [];
  });
}

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/my-profile": "My Profile",
  "/personal-records": "Personal Records",
  "/manual-requests": "Manual Requests",
  "/announcements/new": "New Announcement",
  "/employees/new": "Add Employee",
  "/jobs/new": "New Job Posting"
};

export function getPageTitle(pathname: string, modules: DashboardModule[]): string {
  if (routeTitles[pathname]) return routeTitles[pathname];

  const module = [...modules]
    .sort((left, right) => right.href.length - left.href.length)
    .find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));

  return module?.name ?? "Attendance System";
}
