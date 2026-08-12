import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "../../../lib/session";
import { logout } from "../../login/actions";
import { canManageAnnouncements } from "../permissions";
import { AnnouncementForm } from "./announcement-form";

export const dynamic = "force-dynamic";

export default async function NewAnnouncementPage() {
  const user = await requireCurrentUser();

  if (!canManageAnnouncements(user)) {
    redirect("/announcements");
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
