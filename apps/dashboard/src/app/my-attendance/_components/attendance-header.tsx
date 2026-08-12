import Link from "next/link";
import { logout } from "../../login/actions";
import { MyAttendanceRangeFilter } from "../range-filter";

export function AttendanceHeader({ fullName, range }: { fullName: string; range: string }) {
  return (
    <header className="topbar">
      <div>
        <h1>My Attendance</h1>
        <p className="muted">
          Viewing attendance for <strong>{fullName}</strong>
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <MyAttendanceRangeFilter currentRange={range} />
        <Link href="/my-leave-requests" className="back-link" style={{ textDecoration: "none" }}>
          🌴 Leave Portal
        </Link>
        <Link href="/" className="back-link">
          ← Dashboard
        </Link>
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}
