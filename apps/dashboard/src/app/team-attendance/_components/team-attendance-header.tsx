import Link from "next/link";
import { logout } from "../../login/actions";

export function TeamAttendanceHeader({
  dateText,
  dayNote
}: {
  dateText: string;
  dayNote?: string;
}) {
  return (
    <header className="topbar">
      <div>
        <Link href="/" className="back-link">
          ← Dashboard
        </Link>
        <h1>Team Attendance Status</h1>
        <p className="muted">
          Live team monitor for <strong>{dateText}</strong>
          {dayNote && <span style={{ color: "#c084fc", marginLeft: 8 }}>• {dayNote}</span>}
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
