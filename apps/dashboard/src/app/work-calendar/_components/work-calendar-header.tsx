import Link from "next/link";
import { logout } from "../../login/actions";

export function WorkCalendarHeader() {
  return (
    <header className="topbar">
      <div>
        <Link href="/" className="back-link">
          ← Dashboard
        </Link>
        <h1>Workday Policy & Company Holidays</h1>
        <p className="muted">
          Configure weekly off-days, hybrid schedules, and official holiday exemptions
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
