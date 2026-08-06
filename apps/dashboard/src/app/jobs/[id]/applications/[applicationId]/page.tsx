import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createPrismaClient } from "@attendance/db";
import { getCurrentUser } from "../../../../../lib/session";
import { logout } from "../../../../login/actions";
import { isHr } from "../../../permissions";
import type { EmailCvStepConfig, QuestionnaireStepConfig } from "../../../step-types";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export default async function ApplicationDetailPage({
  params
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { id, applicationId } = await params;
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
        </div>
      </main>
    );
  }

  const application = await db.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      jobPosting: { select: { id: true, title: true } },
      stepResponses: {
        include: {
          step: { include: { interviewer: { select: { fullName: true } } } }
        }
      }
    }
  });

  if (!application || application.jobPosting.id !== id) {
    notFound();
  }

  const responsesByStepId = new Map(application.stepResponses.map((r) => [r.stepId, r]));

  const steps = await db.jobPostingStep.findMany({
    where: { jobPostingId: id },
    orderBy: { order: "asc" },
    include: { interviewer: { select: { fullName: true } } }
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <Link href={`/jobs/${id}/applications`} className="back-link">
            ← Responses
          </Link>
          <h1>{application.fullName}</h1>
          <p className="muted">Applied for {application.jobPosting.title}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </header>

      <section className="panel" style={{ cursor: "default", marginBottom: "20px" }}>
        <h2>Contact Details</h2>
        <p style={{ marginTop: "8px" }}>{application.email}</p>
        <p className="muted">{application.phone}</p>
        <p className="muted" style={{ fontSize: "0.8rem", marginTop: "8px" }}>
          Applied {formatDateTime(application.createdAt)}
        </p>
        <a
          href={`/jobs/${id}/applications/${application.id}/cv`}
          className="back-link"
          style={{ display: "inline-flex", marginTop: "12px" }}
        >
          Download CV
        </a>
      </section>

      {steps.length === 0 ? (
        <section className="panel" style={{ cursor: "default" }}>
          <p className="muted">This job posting has no additional application steps.</p>
        </section>
      ) : (
        <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {steps.map((step, index) => {
            const response = responsesByStepId.get(step.id);

            return (
              <article key={step.id} className="panel" style={{ cursor: "default" }}>
                {step.type === "EMAIL_CV" && (
                  <>
                    <h3>Step {index + 1}: Email CV</h3>
                    <p className="muted" style={{ marginTop: "6px" }}>
                      Target address: {(step.config as EmailCvStepConfig | null)?.email}
                    </p>
                    <p style={{ marginTop: "8px" }}>
                      {response
                        ? "✅ Candidate confirmed they sent their CV."
                        : "⚠️ Not confirmed."}
                    </p>
                  </>
                )}

                {step.type === "QUESTIONNAIRE" && (
                  <>
                    <h3>Step {index + 1}: Questionnaire</h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        marginTop: "10px"
                      }}
                    >
                      {((step.config as QuestionnaireStepConfig | null)?.questions ?? []).map(
                        (question) => {
                          const answer = response?.answer as {
                            answers?: { questionId: string; value: string[] }[];
                          } | null;
                          const found = answer?.answers?.find((a) => a.questionId === question.id);
                          return (
                            <div key={question.id}>
                              <p style={{ fontWeight: 600 }}>{question.prompt}</p>
                              <p className="muted">
                                {found?.value?.join(", ") || "No answer recorded"}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}

                {step.type === "INTERVIEW" && (
                  <>
                    <h3>Step {index + 1}: Interview</h3>
                    <p className="muted" style={{ marginTop: "6px" }}>
                      {step.interviewMode === "ONLINE"
                        ? "Online"
                        : `Physical — ${step.location ?? "TBD"}`}
                      {step.interviewer ? ` with ${step.interviewer.fullName}` : ""}
                    </p>
                    <p style={{ marginTop: "8px" }}>
                      {response?.scheduledAt
                        ? `Scheduled for ${formatDateTime(response.scheduledAt)}`
                        : "⚠️ No slot booked"}
                    </p>
                  </>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
