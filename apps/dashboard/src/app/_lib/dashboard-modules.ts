import { hasPermission, type Permission } from "../../lib/rbac";
import type { SessionUser } from "../../lib/session";
import type { Route } from "next";

export type DashboardModule = {
  name: string;
  permission: Permission;
  description: string;
  href: Route;
};

export const dashboardModules: DashboardModule[] = [
  {
    name: "My Attendance",
    permission: "my_attendance",
    description: "View and manage your own daily attendance logs.",
    href: "/my-attendance"
  },
  {
    name: "My Leave Requests",
    permission: "my_attendance",
    description: "Submit leave applications, track leave balances, and view approval status.",
    href: "/my-leave-requests"
  },
  {
    name: "Leave Settings",
    permission: "reports",
    description: "Configure HR leave categories, quotas, and accrual rules.",
    href: "/leave-settings"
  },
  {
    name: "Employees",
    permission: "enrollment",
    description: "View registered employees and staff details.",
    href: "/employees"
  },
  {
    name: "Team Attendance",
    permission: "team_attendance",
    description: "Monitor the attendance status of your team.",
    href: "/team-attendance"
  },
  {
    name: "Team Management",
    permission: "my_team",
    description: "Manage team notes and performance evaluations.",
    href: "/team-management"
  },
  {
    name: "Performance Tracking & Analysis",
    permission: "reports",
    description: "Manage evaluations and organization performance analytics.",
    href: "/performance"
  },
  {
    name: "My Attendance Correction Requests",
    permission: "manual_reports",
    description: "Submit requests for missing or corrected attendance punches.",
    href: "/my-attendance-correction-requests"
  },
  {
    name: "Employee Leave Requests",
    permission: "approvals",
    description: "Review employee leave requests and decision history.",
    href: "/employee-leave-requests"
  },
  {
    name: "Employee Attendance Correction Requests",
    permission: "approvals",
    description: "Review employee requests for missing or corrected punches.",
    href: "/employee-attendance-correction-requests"
  },
  {
    name: "Add Employee",
    permission: "enrollment",
    description: "Enroll new employees and manage access credentials.",
    href: "/employees/new"
  },
  {
    name: "Workdays & Holidays",
    permission: "reports",
    description: "Configure weekly off-days and company holidays.",
    href: "/work-calendar"
  },
  {
    name: "Company Attendance",
    permission: "company_attendance",
    description: "View organization attendance metrics and punch feeds.",
    href: "/company-attendance"
  },
  {
    name: "Jobs",
    permission: "my_attendance",
    description: "Browse openings and manage job postings.",
    href: "/jobs"
  },
  {
    name: "Announcements",
    permission: "my_attendance",
    description: "Company-wide notices and policy updates from HR.",
    href: "/announcements"
  }
];

export function getAllowedDashboardModules(user: SessionUser): DashboardModule[] {
  const role = user.roleName.toLowerCase();
  return dashboardModules.filter((module) => {
    if (module.name === "Jobs" || module.name === "Announcements") return true;
    if (
      role === "owner" &&
      ["/my-leave-requests", "/my-attendance-correction-requests", "/my-attendance"].includes(
        module.href
      )
    )
      return false;
    if (module.permission !== "approvals") return hasPermission(user, module.permission);
    return (
      ["my_team", "company_attendance", "team_attendance"].some((permission) =>
        hasPermission(user, permission as Permission)
      ) || ["manager", "hr", "owner", "admin"].includes(role)
    );
  });
}
