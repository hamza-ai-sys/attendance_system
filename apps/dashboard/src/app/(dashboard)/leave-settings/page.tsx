import { getCurrentUser } from "../../../lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createPrismaClient } from "@attendance/db";
import { logout } from "../../(auth)/login/actions";
import type { Route } from "next";
import { LeaveSettingsClient } from "./leave-settings-client";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export default async function LeaveSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isAuthorized = user.roleName === "hr" || user.roleName === "owner";

  if (!isAuthorized) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <Link href="/" className="back-link">
              ← Back to Dashboard
            </Link>
            <h1 style={{ color: "#ef4444", background: "none" }}>403 Access Restricted</h1>
          </div>
          <form action={logout}>
            <button type="submit" className="logout-btn">
              Sign Out
            </button>
          </form>
        </header>

        <div
          className="panel"
          style={{ cursor: "default", borderLeft: "4px solid #ef4444", padding: "24px" }}
        >
          <h2>HR Privilege Required</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            The Leave Settings portal is restricted to HR Managers and Company Owners.
          </p>
        </div>
      </main>
    );
  }

  const leaveTypes = await db.leaveTypeConfig.findMany({
    orderBy: { createdAt: "asc" }
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <Link href="/" className="back-link">
              ← Dashboard
            </Link>
          </div>
          <h1>HR Leave Policy Settings</h1>
          <p className="muted">
            Configure employee leave categories, quotas, and monthly/annual accrual rules.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href={"/my-leave-requests" as Route}
            className="back-link"
            style={{ textDecoration: "none" }}
          >
            🌴 Employee Leave Portal
          </Link>
          <form action={logout}>
            <button type="submit" className="logout-btn">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <LeaveSettingsClient leaveTypes={leaveTypes} />
    </main>
  );
}
