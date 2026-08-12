import { deleteAnnouncement } from "../actions";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: { fullName: string };
};

type AnnouncementListProps = {
  announcements: Announcement[];
  canManageAnnouncements: boolean;
};

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function AnnouncementCard({
  announcement,
  canManageAnnouncements
}: {
  announcement: Announcement;
  canManageAnnouncements: boolean;
}) {
  return (
    <article className="panel" style={{ cursor: "default" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px"
        }}
      >
        <h2>{announcement.title}</h2>
        {canManageAnnouncements && (
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
  );
}

export function AnnouncementList({ announcements, canManageAnnouncements }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return (
      <section className="panel" style={{ cursor: "default" }}>
        <p className="muted">There are no announcements yet.</p>
      </section>
    );
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          canManageAnnouncements={canManageAnnouncements}
        />
      ))}
    </section>
  );
}
