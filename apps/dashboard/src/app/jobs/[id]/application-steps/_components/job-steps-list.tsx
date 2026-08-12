import { deleteJobStep } from "../../../steps-actions";
import type { EmailCvStepConfig, QuestionnaireStepConfig } from "../../../step-types";
import type { getJobStepsData } from "../queries";

type Step = NonNullable<Awaited<ReturnType<typeof getJobStepsData>>["job"]>["steps"][number];
const labels: Record<string, string> = {
  EMAIL_CV: "Email CV",
  QUESTIONNAIRE: "Questionnaire",
  INTERVIEW: "Interview"
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function stepSummary(step: Step): string {
  if (step.type === "EMAIL_CV")
    return `Candidates confirm they emailed their CV to ${(step.config as EmailCvStepConfig | null)?.email ?? "—"}`;
  if (step.type === "QUESTIONNAIRE") {
    const count = (step.config as QuestionnaireStepConfig | null)?.questions?.length ?? 0;
    return `${count} question${count === 1 ? "" : "s"} for the candidate to answer`;
  }
  const mode =
    step.interviewMode === "ONLINE" ? "Online" : `Physical — ${step.location ?? "location TBD"}`;
  const interviewer = step.interviewer ? `with ${step.interviewer.fullName}` : "";
  const window =
    step.availabilityStart && step.availabilityEnd
      ? `${formatDate(step.availabilityStart)} – ${formatDate(step.availabilityEnd)}, ${step.dailyStartTime}–${step.dailyEndTime}`
      : "";
  return `${mode} interview ${interviewer} · ${window}`.trim();
}

export function JobStepsList({ jobId, steps }: { jobId: string; steps: Step[] }) {
  if (!steps.length) return null;
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
      {steps.map((step, index) => (
        <article key={step.id} className="panel" style={{ cursor: "default" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <span className="status-badge">
                Step {index + 1} · {labels[step.type]}
              </span>
              <p>{stepSummary(step)}</p>
            </div>
            <form action={deleteJobStep}>
              <input type="hidden" name="stepId" value={step.id} />
              <input type="hidden" name="jobPostingId" value={jobId} />
              <button type="submit" className="danger-btn">
                Remove
              </button>
            </form>
          </div>
        </article>
      ))}
    </section>
  );
}
