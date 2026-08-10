import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createPrismaClient } from "@attendance/db";
import { getCurrentUser } from "../../../../lib/session";
import { logout } from "../../../login/actions";
import { isHr } from "../../permissions";
import { deleteJobStep } from "../../steps-actions";
import { AddStepPanel } from "./add-step-panel";
import type { EmailCvStepConfig, QuestionnaireStepConfig } from "../../step-types";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function stepSummary(step: {
  type: string;
  config: unknown;
  interviewMode: string | null;
  location: string | null;
  interviewer: { fullName: string } | null;
  availabilityStart: Date | null;
  availabilityEnd: Date | null;
  dailyStartTime: string | null;
  dailyEndTime: string | null;
}): string {
  if (step.type === "EMAIL_CV") {
    const config = step.config as EmailCvStepConfig | null;
    return `Candidates confirm they emailed their CV to ${config?.email ?? "—"}`;
  }

  if (step.type === "QUESTIONNAIRE") {
    const config = step.config as QuestionnaireStepConfig | null;
    const count = config?.questions?.length ?? 0;
    return `${count} question${count === 1 ? "" : "s"} for the candidate to answer`;
  }

  if (step.type === "INTERVIEW") {
    const modeLabel =
      step.interviewMode === "ONLINE" ? "Online" : `Physical — ${step.location ?? "location TBD"}`;
    const withWhom = step.interviewer ? `with ${step.interviewer.fullName}` : "";
    const window =
      step.availabilityStart && step.availabilityEnd
        ? `${formatDate(step.availabilityStart)} – ${formatDate(step.availabilityEnd)}, ${step.dailyStartTime}–${step.dailyEndTime}`
        : "";
    return `${modeLabel} interview ${withWhom} · ${window}`.trim();
  }

  return "";
}

const STEP_TYPE_LABELS: Record<string, string> = {
  EMAIL_CV: "Email CV",
  QUESTIONNAIRE: "Questionnaire",
  INTERVIEW: "Interview"
};

export default async function JobStepsPage({ params }: { params: Promise<{ id: string }> }) {
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
            Only <strong>HR</strong> can configure job application steps.
          </p>
        </div>
      </main>
    );
  }

  const job = await db.jobPosting.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { order: "asc" },
        include: { interviewer: { select: { fullName: true } } }
      }
    }
  });

  if (!job) {
    notFound();
  }

  const employees = await db.employee.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" }
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <Link href="/jobs" className="back-link">
            ← Jobs
          </Link>
          <h1>Application Steps: {job.title}</h1>
          <p className="muted">
            Optional. Add steps candidates must complete to apply — or skip this and go straight
            back to Jobs.
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

      {job.steps.length > 0 && (
        <section
          style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}
        >
          {job.steps.map((step, index) => (
            <article key={step.id} className="panel" style={{ cursor: "default" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px"
                }}
              >
                <div>
                  <span
                    className="status-badge"
                    style={{
                      background: "rgba(139, 92, 246, 0.15)",
                      color: "#c084fc",
                      border: "1px solid rgba(139, 92, 246, 0.4)"
                    }}
                  >
                    Step {index + 1} · {STEP_TYPE_LABELS[step.type]}
                  </span>
                  <p style={{ marginTop: "8px" }}>{stepSummary(step)}</p>
                </div>
                <form action={deleteJobStep}>
                  <input type="hidden" name="stepId" value={step.id} />
                  <input type="hidden" name="jobPostingId" value={job.id} />
                  <button
                    type="submit"
                    className="back-link"
                    style={{
                      cursor: "pointer",
                      background: "none",
                      color: "#f87171",
                      borderColor: "rgba(248, 113, 113, 0.4)"
                    }}
                  >
                    Remove
                  </button>
                </form>
              </div>
            </article>
          ))}
        </section>
      )}

      <AddStepPanel jobPostingId={job.id} employees={employees} />

      <div style={{ marginTop: "24px" }}>
        <Link
          href="/jobs"
          className="btn-primary"
          style={{ display: "inline-block", padding: "10px 18px", fontSize: "0.9rem" }}
        >
          Done — Back to Jobs
        </Link>
      </div>
    </main>
  );
}
