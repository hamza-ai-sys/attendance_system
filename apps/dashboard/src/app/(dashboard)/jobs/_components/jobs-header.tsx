import Link from "next/link";
import { logout } from "../../../(auth)/login/actions";

export function JobsHeader({ signedIn, isHr }: { signedIn: boolean; isHr: boolean }) {
  return (
    <header className="topbar">
      <div>
        {signedIn && (
          <Link href="/" className="back-link">
            ← Dashboard
          </Link>
        )}
        <h1>Open Positions</h1>
        <p className="muted">
          {isHr
            ? "Manage job postings and review applications."
            : "Browse current openings and apply below."}
        </p>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {isHr && (
          <Link href="/jobs/new" className="back-link">
            + Post a New Job
          </Link>
        )}
        {signedIn && (
          <form action={logout}>
            <button type="submit" className="logout-btn">
              Sign Out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
