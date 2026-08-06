import Link from "next/link";
import { createPrismaClient } from "@attendance/db";
import { getCurrentUser } from "../../lib/session";
import { logout } from "../login/actions";
import { setJobPostingStatus } from "./actions";
import { isHr } from "./permissions";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export default async function JobsPage() {
  const user = await getCurrentUser();
  const userIsHr = isHr(user);

  const jobPostings = await db.jobPosting.findMany({
    where: userIsHr ? {} : { status: "OPEN" },
    include: { _count: { select: { applications: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            {user && (
              <Link href="/" className="back-link">
                ← Dashboard
              </Link>
            )}
          </div>
          <h1>Open Positions</h1>
          <p className="muted">
            {userIsHr
              ? "Manage job postings and review applications."
              : "Browse current openings and apply below."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {userIsHr && (
            <Link
              href="/jobs/new"
              className="back-link"
              style={{ borderColor: "rgba(139, 92, 246, 0.4)", color: "#c084fc" }}
            >
              + Post a New Job
            </Link>
          )}
          {user && (
            <form action={logout}>
              <button type="submit" className="logout-btn">
                Sign Out
              </button>
            </form>
          )}
        </div>
      </header>

      {jobPostings.length === 0 ? (
        <section className="panel" style={{ cursor: "default" }}>
          <p className="muted">There are no open positions right now. Please check back later.</p>
        </section>
      ) : (
        <section className="panel-grid" aria-label="Job postings">
          {jobPostings.map((job) => (
            <article key={job.id} className="panel" style={{ cursor: "default" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px"
                }}
              >
                <h2>{job.title}</h2>
                <span
                  className="status-badge"
                  style={
                    job.status === "OPEN"
                      ? {
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#6ee7b7",
                          border: "1px solid rgba(16, 185, 129, 0.4)"
                        }
                      : {
                          background: "rgba(148, 163, 184, 0.15)",
                          color: "#94a3b8",
                          border: "1px solid rgba(148, 163, 184, 0.4)"
                        }
                  }
                >
                  {job.status}
                </span>
              </div>

              <p className="muted" style={{ marginTop: "4px" }}>
                {[job.department, job.location, job.employmentType].filter(Boolean).join(" · ") ||
                  "Details inside"}
              </p>

              <p className="muted" style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                Posted {formatDate(job.createdAt)}
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="btn-primary"
                  style={{ padding: "10px 18px", fontSize: "0.9rem" }}
                >
                  View & Apply
                </Link>

                {userIsHr && (
                  <>
                    <Link
                      href={`/jobs/${job.id}/applications`}
                      className="back-link"
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      Responses ({job._count.applications})
                    </Link>

                    <form action={setJobPostingStatus}>
                      <input type="hidden" name="id" value={job.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={job.status === "OPEN" ? "CLOSED" : "OPEN"}
                      />
                      <button
                        type="submit"
                        className="back-link"
                        style={{ cursor: "pointer", background: "none" }}
                      >
                        {job.status === "OPEN" ? "Close posting" : "Reopen posting"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
