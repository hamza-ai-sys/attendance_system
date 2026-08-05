import Link from "next/link";
import { notFound } from "next/navigation";
import { createPrismaClient } from "@attendance/db";
import { getCurrentUser } from "../../../lib/session";
import { logout } from "../../login/actions";
import { isHr } from "../permissions";
import { ApplyForm } from "./apply-form";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const userIsHr = isHr(user);

  const job = await db.jobPosting.findUnique({
    where: { id },
    include: { createdBy: { select: { fullName: true } } }
  });

  if (!job) {
    notFound();
  }

  if (job.status !== "OPEN" && !userIsHr) {
    notFound();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <Link href="/jobs" className="back-link">
            ← Jobs
          </Link>
          <h1>{job.title}</h1>
          <p className="muted">
            {[job.department, job.location, job.employmentType].filter(Boolean).join(" · ") ||
              "No additional details"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {userIsHr && (
            <Link
              href={`/jobs/${job.id}/applications`}
              className="back-link"
              style={{ borderColor: "rgba(139, 92, 246, 0.4)", color: "#c084fc" }}
            >
              View Responses
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

      <section className="panel" style={{ cursor: "default", marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "8px"
          }}
        >
          <h2>Job Description</h2>
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
        <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "16px" }}>
          Posted {formatDate(job.createdAt)} by {job.createdBy.fullName}
        </p>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{job.description}</p>
      </section>

      {job.status === "OPEN" ? (
        <ApplyForm jobPostingId={job.id} />
      ) : (
        <section className="panel" style={{ cursor: "default" }}>
          <p className="muted">This position is closed and is no longer accepting applications.</p>
        </section>
      )}
    </main>
  );
}
