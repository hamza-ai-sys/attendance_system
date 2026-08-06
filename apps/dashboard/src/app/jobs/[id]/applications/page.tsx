import Link from "next/link";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { createPrismaClient } from "@attendance/db";
import { getCurrentUser } from "../../../../lib/session";
import { logout } from "../../../login/actions";
import { updateApplicationStatus } from "../../actions";
import { isHr } from "../../permissions";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

const STATUS_OPTIONS = ["SUBMITTED", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"] as const;

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

const statusColors: Record<string, { background: string; color: string; border: string }> = {
  SUBMITTED: {
    background: "rgba(96, 165, 250, 0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(96, 165, 250, 0.3)"
  },
  REVIEWED: {
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.3)"
  },
  SHORTLISTED: {
    background: "rgba(139, 92, 246, 0.15)",
    color: "#c084fc",
    border: "1px solid rgba(139, 92, 246, 0.3)"
  },
  REJECTED: {
    background: "rgba(248, 113, 113, 0.15)",
    color: "#f87171",
    border: "1px solid rgba(248, 113, 113, 0.3)"
  },
  HIRED: {
    background: "rgba(16, 185, 129, 0.15)",
    color: "#6ee7b7",
    border: "1px solid rgba(16, 185, 129, 0.3)"
  }
};

export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
            Only <strong>HR</strong> can view applicant responses.
          </p>
        </div>
      </main>
    );
  }

  const job = await db.jobPosting.findUnique({
    where: { id },
    include: {
      applications: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!job) {
    notFound();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <Link href="/jobs" className="back-link">
            ← Jobs
          </Link>
          <h1>Responses: {job.title}</h1>
          <p className="muted">
            {job.applications.length} application{job.applications.length === 1 ? "" : "s"} received
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href={`/jobs/${job.id}`} className="back-link">
            View Posting
          </Link>
          <form action={logout}>
            <button type="submit" className="logout-btn">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {job.applications.length === 0 ? (
        <section className="panel" style={{ cursor: "default" }}>
          <p className="muted">No one has applied to this position yet.</p>
        </section>
      ) : (
        <section className="panel" style={{ cursor: "default", display: "block" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="directory-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact</th>
                  <th>Applied</th>
                  <th>CV</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {job.applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <Link
                        href={`/jobs/${job.id}/applications/${application.id}` as Route}
                        className="back-link"
                        style={{ display: "inline-flex" }}
                      >
                        {application.fullName}
                      </Link>
                    </td>
                    <td>
                      <div>{application.email}</div>
                      <div className="muted" style={{ fontSize: "0.8rem" }}>
                        {application.phone}
                      </div>
                    </td>
                    <td className="muted">{formatDateTime(application.createdAt)}</td>
                    <td>
                      <a
                        href={`/jobs/${job.id}/applications/${application.id}/cv`}
                        className="back-link"
                        style={{ display: "inline-flex" }}
                      >
                        Download CV
                      </a>
                    </td>
                    <td>
                      <form
                        action={updateApplicationStatus}
                        style={{ display: "flex", gap: "8px", alignItems: "center" }}
                      >
                        <input type="hidden" name="applicationId" value={application.id} />
                        <input type="hidden" name="jobPostingId" value={job.id} />
                        <select
                          name="status"
                          defaultValue={application.status}
                          className="form-control"
                          style={{
                            padding: "6px 10px",
                            fontSize: "0.8rem",
                            width: "auto",
                            ...statusColors[application.status]
                          }}
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="back-link"
                          style={{
                            cursor: "pointer",
                            background: "none",
                            padding: "6px 10px",
                            fontSize: "0.8rem"
                          }}
                        >
                          Update
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
