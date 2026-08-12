import Link from "next/link";
import { logout } from "../login/actions";

export function DashboardHeader({ fullName, roleName }: { fullName: string; roleName: string }) {
  return (
    <header className="topbar">
      <div>
        <h1>Attendance System</h1>
        <p className="muted">
          Welcome back, <strong>{fullName}</strong> ({roleName})
        </p>
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Link href="/my-profile" className="back-link">
          👤 My Profile
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
