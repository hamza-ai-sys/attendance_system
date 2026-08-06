import Link from "next/link";
import { createPrismaClient } from "@attendance/db";
import { getCurrentUser } from "../../lib/session";
import { logout } from "../login/actions";
import { isHr } from "./permissions";
import { deleteAnnouncement } from "./actions";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export default async function AnnouncementsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <h1>Announcements</h1>
          </div>
        </header>
        <section className="panel" style={{ cursor: "default" }}>
          <p className="muted">Please sign in to view company announcements.</p>
        </section>
      </main>
    );
  }

  const userIsHr = isHr(user);

  const announcements = await db.announcement.findMany({
    include: { createdBy: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" }
  });

  // Mark announcements as read for this viewer the moment they open this page.
  await db.employee.update({
    where: { id: user.employeeId },
    data: { lastAnnouncementsViewedAt: new Date() }
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <Link href="/" className="back-link">
            ← Dashboard
          </Link>
          <h1>Announcements</h1>
          <p className="muted">Company-wide notices and policy updates.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {userIsHr && (
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

      {announcements.length === 0 ? (
        <section className="panel" style={{ cursor: "default" }}>
          <p className="muted">There are no announcements yet.</p>
        </section>
      ) : (
        <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {announcements.map((announcement) => (
            <article key={announcement.id} className="panel" style={{ cursor: "default" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px"
                }}
              >
                <h2>{announcement.title}</h2>
                {userIsHr && (
                  <form action={deleteAnnouncement}>
                    <input type="hidden" name="id" value={announcement.id} />
                    <button
                      type="submit"
                      className="back-link"
                      style={{
                        cursor: "pointer",
                        background: "none",
                        color: "#f87171",
                        borderColor: "rgba(248, 113, 113, 0.4)"
                      }}
                    >
                      Delete
                    </button>
                  </form>
                )}
              </div>

              <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "12px" }}>
                Posted {formatDateTime(announcement.createdAt)} by {announcement.createdBy.fullName}
              </p>

              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{announcement.content}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
