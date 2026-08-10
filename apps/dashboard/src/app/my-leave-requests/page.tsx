import { getCurrentUser } from "../../lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createPrismaClient } from "@attendance/db";
import { calculateAvailableBalance } from "@attendance/attendance-core";
import { logout } from "../login/actions";
import type { Route } from "next";
import { LeaveRequestsClient, type LeaveBalanceItem, type LeaveRequestItem, type LeaveTypeOption } from "./leave-requests-client";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export default async function LeaveRequestsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.roleName === "owner") {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <Link href="/" className="back-link">← Back to Dashboard</Link>
            <h1 style={{ color: "#ef4444", background: "none" }}>Access Restricted</h1>
          </div>
          <form action={logout}>
            <button type="submit" className="logout-btn">Sign Out</button>
          </form>
        </header>
        <div className="panel" style={{ cursor: "default", borderLeft: "4px solid #ef4444", padding: "24px" }}>
          <h2>Owner Notice</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            Company Owners cannot submit leave applications. Use the <Link href="/employee-leave-requests" style={{ color: "#60a5fa" }}>employee leave requests</Link> page to review requests.
          </p>
        </div>
      </main>
    );
  }

  const currentYear = new Date().getFullYear();

  // 1. Fetch active HR-defined Leave Types
  const activeLeaveTypes = await db.leaveTypeConfig.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  // 2. Fetch employee balances for current year
  const rawBalances = await db.leaveBalance.findMany({
    where: {
      employeeId: user.employeeId,
      year: currentYear
    },
    include: { leaveType: true }
  });

  // If some active leave types do not have balance records yet, auto-create them
  const formattedBalances: LeaveBalanceItem[] = [];
  for (const lt of activeLeaveTypes) {
    const existing = rawBalances.find((b) => b.leaveTypeId === lt.id);
    const accrued = lt.defaultAllocation;
    const used = existing ? existing.used : 0;
    const carriedOver = existing ? existing.carriedOver : 0;
    const allocated = existing ? existing.allocated : lt.defaultAllocation;

    if (!existing) {
      await db.leaveBalance.create({
        data: {
          employeeId: user.employeeId,
          year: currentYear,
          leaveTypeId: lt.id,
          allocated,
          accrued,
          used,
          carriedOver
        }
      });
    } else if (existing.accrued !== accrued) {
      await db.leaveBalance.update({
        where: { id: existing.id },
        data: { accrued, allocated }
      });
    }

    const available = calculateAvailableBalance(accrued, carriedOver, used);
    formattedBalances.push({
      id: existing ? existing.id : lt.id,
      leaveTypeId: lt.id,
      leaveTypeName: lt.name,
      leaveTypeCode: lt.code,
      isPaid: lt.isPaid,
      allocated,
      accrued,
      used,
      carriedOver,
      available
    });
  }

  // 3. Fetch employee's submitted leave requests
  const rawRequests = await db.leaveRequest.findMany({
    where: { employeeId: user.employeeId },
    include: { leaveType: true },
    orderBy: { createdAt: "desc" }
  });

  const formattedRequests: LeaveRequestItem[] = rawRequests.map((r) => ({
    id: r.id,
    leaveTypeName: r.leaveType.name,
    leaveTypeCode: r.leaveType.code,
    startDateStr: formatDate(new Date(r.startDate)),
    endDateStr: formatDate(new Date(r.endDate)),
    totalDays: r.totalDays,
    paidDays: r.paidDays,
    unpaidDays: r.unpaidDays,
    reason: r.reason,
    status: r.status,
    rejectionReason: r.rejectionReason,
    createdAtStr: formatDate(new Date(r.createdAt))
  }));

  const activeTypesOptions: LeaveTypeOption[] = activeLeaveTypes.map((t) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    isPaid: t.isPaid
  }));

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <Link href="/" className="back-link">← Dashboard</Link>
          </div>
          <h1>My Leave Requests</h1>
          <p className="muted">
            Viewing time-off balances & submitted leave applications for <strong>{user.fullName}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {(user.roleName === "hr" || user.roleName === "owner") && (
            <Link href={"/leave-settings" as Route} className="back-link" style={{ textDecoration: "none" }}>
              ⚙️ HR Leave Policy Settings
            </Link>
          )}
          <form action={logout}>
            <button type="submit" className="logout-btn">Sign Out</button>
          </form>
        </div>
      </header>

      <LeaveRequestsClient
        balances={formattedBalances}
        activeTypes={activeTypesOptions}
        myRequests={formattedRequests}
        userRole={user.roleName}
      />
    </main>
  );
}
