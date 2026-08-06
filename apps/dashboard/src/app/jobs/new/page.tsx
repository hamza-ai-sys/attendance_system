import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/session";
import { logout } from "../../login/actions";
import { isHr } from "../permissions";
import { JobPostingForm } from "./job-form";

export const dynamic = "force-dynamic";

export default async function NewJobPostingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isHr(user)) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <Link href="/jobs" className="back-link">
              ← Jobs
            </Link>
            <h1 style={{ color: "#ef4444", background: "none" }}>403 Access Restricted</h1>
          </div>
          <form action={logout}>
            <button type="submit" className="logout-btn">
              Sign Out
            </button>
          </form>
        </header>

        <div
          className="panel"
          style={{ cursor: "default", borderLeft: "4px solid #ef4444", padding: "24px" }}
        >
          <h2>HR Privilege Required</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            Only <strong>HR</strong> can create new job postings.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <Link href="/jobs" className="back-link">
            ← Jobs
          </Link>
          <h1>Post a New Job</h1>
          <p className="muted">Publish an opening to the public Jobs page.</p>
        </div>
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </header>

      <JobPostingForm />
    </main>
  );
}
