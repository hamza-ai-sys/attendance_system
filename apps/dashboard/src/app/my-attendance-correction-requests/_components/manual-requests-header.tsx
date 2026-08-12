import Link from "next/link";
import { logout } from "../../login/actions";

export function ManualRequestsHeader({
  fullName,
  roleName
}: {
  fullName: string;
  roleName: string;
}) {
  return (
    <header className="topbar">
      <div>
        <h1>My Attendance Correction Requests</h1>
        <p className="muted">
          Logged in as <strong>{fullName}</strong> ({roleName})
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
