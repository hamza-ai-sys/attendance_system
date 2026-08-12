import Link from "next/link";
import { logout } from "../../../../login/actions";
import type { getNotesHistoryData } from "../queries";

type Data = Awaited<ReturnType<typeof getNotesHistoryData>>;

function NotesHeader({ employee }: { employee: NonNullable<Data["employee"]> }) {
  return (
    <header className="topbar">
      <div>
        <Link href="/team-management" className="back-link">
          ← Back to My Team
        </Link>
        <h1>Notes History: {employee.fullName}</h1>
        <p className="muted">
          Viewing previous notes for <strong>{employee.fullName}</strong> (
          {employee.role?.name ?? "Employee"})
        </p>
      </div>
      <form action={logout}>
        <button type="submit" className="logout-btn">
          Sign Out
        </button>
      </form>
    </header>
  );
}

function NoteCard({ note }: { note: Data["notes"][number] }) {
  return (
    <article
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "20px 24px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <span className={`note-badge ${note.visibility.toLowerCase()}`}>
            {note.visibility === "PRIVATE" ? "🔒 Personal Note" : "🌐 Public Note"}
          </span>{" "}
          <strong>
            {note.authorName} <span className="muted">({note.authorRole})</span>
          </strong>
        </div>
        <time className="muted">{new Date(note.createdAt).toLocaleString()}</time>
      </div>
      <div
        style={{
          background: "rgba(15,23,42,.5)",
          borderRadius: 10,
          padding: 16,
          marginTop: 12,
          whiteSpace: "pre-wrap"
        }}
      >
        {note.content}
      </div>
    </article>
  );
}

export function NotesHistoryView({
  employee,
  notes
}: {
  employee: NonNullable<Data["employee"]>;
  notes: Data["notes"];
}) {
  return (
    <>
      <NotesHeader employee={employee} />
      <div
        className="panel"
        style={{ cursor: "default", display: "flex", justifyContent: "space-between" }}
      >
        <div>
          <h2>{employee.fullName}</h2>
          <p className="muted">
            {employee.email} {employee.employeeCode && `• Code: ${employee.employeeCode}`}
          </p>
        </div>
        <span className="note-badge public">Total Notes: {notes.length}</span>
      </div>
      <section className="panel" style={{ cursor: "default", marginTop: 24 }}>
        <h2>Previous Recorded Notes</h2>
        {notes.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <p className="muted">No previous notes recorded for {employee.fullName} yet.</p>
        )}
      </section>
    </>
  );
}
