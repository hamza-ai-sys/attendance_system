import Link from "next/link";
import { logout } from "../../login/actions";

export function TeamManagementHeader() {
  return (
    <header className="topbar">
      <div>
        <Link href="/" className="back-link">
          ← Dashboard
        </Link>
        <h1>Team Management</h1>
        <p className="muted">
          Manage your team members, record employee notes, and complete performance documents
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
