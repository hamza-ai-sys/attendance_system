import Link from "next/link";
import { logout } from "../../../(auth)/login/actions";

type AnnouncementsHeaderProps = {
  canManageAnnouncements: boolean;
};

export function AnnouncementsHeader({ canManageAnnouncements }: AnnouncementsHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <Link href="/" className="back-link">
          ← Home
        </Link>
        <h1>Announcements</h1>
        <p className="muted">Company-wide notices and policy updates.</p>
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {canManageAnnouncements && (
          <Link
            href="/announcements/new"
            className="back-link"
            style={{ borderColor: "rgba(139, 92, 246, 0.4)", color: "#c084fc" }}
          >
            + Post Announcement
          </Link>
        )}
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}
