import Link from "next/link";
import { logout } from "../../../(auth)/login/actions";

export function LeaveRequestsHeader({
  fullName,
  roleName
}: {
  fullName: string;
  roleName: string;
}) {
  return (
    <header className="topbar">
      <div>
        <Link href="/" className="back-link">
          ← Dashboard
        </Link>
        <h1>My Leave Requests</h1>
        <p className="muted">
          Viewing time-off balances & submitted leave applications for <strong>{fullName}</strong>
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {(roleName === "hr" || roleName === "owner") && (
          <Link href="/leave-settings" className="back-link" style={{ textDecoration: "none" }}>
            ⚙️ HR Leave Policy Settings
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
