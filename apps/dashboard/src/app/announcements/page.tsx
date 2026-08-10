import { getCurrentUser } from "../../lib/session";
import { AnnouncementList } from "./_components/announcement-list";
import { AnnouncementsHeader } from "./_components/announcements-header";
import { canManageAnnouncements } from "./permissions";
import { getAnnouncements, markAnnouncementsViewed } from "./queries";

export const dynamic = "force-dynamic";

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

  const announcements = await getAnnouncements();
  await markAnnouncementsViewed(user.employeeId);
  const canManage = canManageAnnouncements(user);

  return (
    <main className="app-shell">
      <AnnouncementsHeader canManageAnnouncements={canManage} />
      <AnnouncementList announcements={announcements} canManageAnnouncements={canManage} />
    </main>
  );
}
