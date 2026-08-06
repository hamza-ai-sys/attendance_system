import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/session";
import { logout } from "../../login/actions";
import { isHr } from "../permissions";
import { AnnouncementForm } from "./announcement-form";

export const dynamic = "force-dynamic";

export default async function NewAnnouncementPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isHr(user)) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <Link href="/announcements" className="back-link">
              ← Announcements
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
            Only <strong>HR</strong> can post company-wide announcements.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <Link href="/announcements" className="back-link">
            ← Announcements
          </Link>
          <h1>Post an Announcement</h1>
          <p className="muted">Share a company-wide notice or policy update with everyone.</p>
        </div>
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </header>

      <AnnouncementForm />
    </main>
  );
}
