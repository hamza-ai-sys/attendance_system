import { getCurrentUser } from "../lib/session";
import { hasPermission, type Permission } from "../lib/rbac";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "./login/actions";
import { createPrismaClient } from "@attendance/db";
import type { Route } from "next";

export const dynamic = "force-dynamic";

// Force Next.js server cache re-evaluation for Prisma Client models
const db = createPrismaClient(process.env.DATABASE_URL as string);

const allModules: { name: string; permission: Permission; description: string; href?: string }[] = [
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
    description: "Configure HR leave categories, quotas, and monthly/annual accrual rules.",
    href: "/leave-settings"
  },
  {
    name: "Employees",
    permission: "enrollment",
    description: "View the complete list of all registered employees and staff details.",
    href: "/employees"
  },
  {
    name: "Team Attendance",
    permission: "team_attendance",
    description: "Monitor the attendance status of your entire team.",
    href: "/team-attendance"
  },
  {
    name: "Team Management",
    permission: "my_team",
    description:
      "View team members in column layout, manage employee personal/public notes, and complete performance evaluations.",
    href: "/team-management"
  },
  {
    name: "Performance Tracking & Analysis",
    permission: "reports",
    description:
      "HR performance evaluation builder, manager scheduling, and organizational performance analytics.",
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
    description: "Review employee leave requests and their decision history.",
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
    description: "Configure weekly off-days and manage official company holidays.",
    href: "/work-calendar"
  },
  {
    name: "Company Attendance",
    permission: "company_attendance",
    description: "Executive organization attendance metrics and real-time punch feeds.",
    href: "/company-attendance"
  },
  {
    name: "Jobs",
    permission: "my_attendance",
    description: "Browse open positions, apply, and (for HR) manage job postings.",
    href: "/jobs"
  },

  {
    name: "Announcements",
    permission: "my_attendance",
    description: "Company-wide notices and policy updates from HR.",
    href: "/announcements"
  }
];

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const roleName = user.roleName?.toLowerCase() || "";

  // Filter modules based on user role permissions & role fallback (Jobs and Announcements are visible to everyone)
  const allowedModules = allModules.filter((m) => {
    if (m.name === "Jobs" || m.name === "Announcements") {
      return true;
    }

    if (roleName === "owner") {
      // Company Owners cannot apply for leave, submit manual requests, or view personal attendance
      if (
        m.href === "/my-leave-requests" ||
        m.href === "/my-attendance-correction-requests" ||
        m.href === "/my-attendance"
      ) {
        return false;
      }
    }

    if (m.permission === "approvals") {
      return (
        hasPermission(user, "my_team") ||
        hasPermission(user, "company_attendance") ||
        hasPermission(user, "team_attendance") ||
        ["manager", "hr", "owner", "admin"].includes(roleName)
      );
    }

    return hasPermission(user, m.permission);
  });

  // Query live pending approvals count for users with approval privileges
  let pendingLeaveRequestsCount = 0;
  let pendingAttendanceCorrectionRequestsCount = 0;
  const canApprove = hasPermission(user, "approvals");

  if (canApprove) {
    if (roleName === "manager") {
      pendingAttendanceCorrectionRequestsCount = await db.manualAttendanceRequest.count({
        where: {
          status: "PENDING_MANAGER",
          employee: { supervisorId: user.employeeId },
          employeeId: { not: user.employeeId }
        }
      });
      pendingLeaveRequestsCount = await db.leaveRequest.count({
        where: {
          status: "PENDING_MANAGER",
          employee: { supervisorId: user.employeeId },
          employeeId: { not: user.employeeId }
        }
      });
    } else {
      pendingAttendanceCorrectionRequestsCount = await db.manualAttendanceRequest.count({
        where: { status: { in: ["PENDING_MANAGER", "PENDING_HR"] } }
      });
      pendingLeaveRequestsCount = await db.leaveRequest.count({
        where: { status: { in: ["PENDING_MANAGER", "PENDING_HR"] } }
      });
    }
  }
  const currentEmployee = await db.employee.findUnique({
    where: { id: user.employeeId },
    select: { lastAnnouncementsViewedAt: true }
  });

  const unreadAnnouncementsCount = await db.announcement.count({
    where: { createdAt: { gt: currentEmployee?.lastAnnouncementsViewedAt ?? new Date(0) } }
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Attendance System</h1>
          <p className="muted">
            Welcome back, <strong>{user.fullName}</strong> ({user.roleName})
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href={"/my-profile" as Route}
            className="back-link"
            style={{ textDecoration: "none" }}
          >
            👤 My Profile
          </Link>
          <form action={logout}>
            <button type="submit" className="logout-btn">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <section className="panel-grid" aria-label="Dashboard modules">
        {allowedModules.length === 0 && (
          <p className="muted">You do not have permission to view any modules.</p>
        )}
        {allowedModules.map((module) => {
          const pendingCount =
            module.href === "/employee-leave-requests"
              ? pendingLeaveRequestsCount
              : module.href === "/employee-attendance-correction-requests"
                ? pendingAttendanceCorrectionRequestsCount
                : 0;
          const isAnnouncements = module.name === "Announcements";

          const content = (
            <article className="panel" key={module.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
              >
                <h2>{module.name}</h2>
                {pendingCount > 0 && (
                  <span
                    style={{
                      background: "rgba(251, 191, 36, 0.2)",
                      color: "#fbbf24",
                      border: "1px solid rgba(251, 191, 36, 0.4)",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: 600
                    }}
                  >
                    {pendingCount} Pending
                  </span>
                )}
                {isAnnouncements && unreadAnnouncementsCount > 0 && (
                  <span
                    style={{
                      background: "rgba(96, 165, 250, 0.2)",
                      color: "#60a5fa",
                      border: "1px solid rgba(96, 165, 250, 0.4)",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: 600
                    }}
                  >
                    {unreadAnnouncementsCount} New
                  </span>
                )}
              </div>
              <p className="muted">{module.description}</p>
            </article>
          );

          if (module.href) {
            return (
              <Link href={module.href as Route} key={module.name} style={{ display: "contents" }}>
                {content}
              </Link>
            );
          }

          return content;
        })}
      </section>
    </main>
  );
}
