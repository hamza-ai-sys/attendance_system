import type { EmailCvStepConfig, QuestionnaireStepConfig } from "../../../../step-types";
import type { getApplicationDetail } from "../queries";
type Data = Awaited<ReturnType<typeof getApplicationDetail>>;
type Response = NonNullable<Data["application"]>["stepResponses"][number];

function StepResponse({
  step,
  response,
  index
}: {
  step: Data["steps"][number];
  response?: Response;
  index: number;
}) {
  if (step.type === "EMAIL_CV")
    return (
      <article className="panel">
        <h3>Step {index + 1}: Email CV</h3>
        <p className="muted">Target address: {(step.config as EmailCvStepConfig | null)?.email}</p>
        <p>{response ? "✅ Candidate confirmed they sent their CV." : "⚠️ Not confirmed."}</p>
      </article>
    );
  if (step.type === "INTERVIEW")
    return (
      <article className="panel">
        <h3>Step {index + 1}: Interview</h3>
        <p className="muted">
          {step.interviewMode === "ONLINE" ? "Online" : `Physical — ${step.location ?? "TBD"}`}
          {step.interviewer && ` with ${step.interviewer.fullName}`}
        </p>
        <p>
          {response?.scheduledAt
            ? `Scheduled for ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(response.scheduledAt)}`
            : "⚠️ No slot booked"}
        </p>
      </article>
    );
  const answers = (
    response?.answer as { answers?: { questionId: string; value: string[] }[] } | null
  )?.answers;
  return (
    <article className="panel">
      <h3>Step {index + 1}: Questionnaire</h3>
      {((step.config as QuestionnaireStepConfig | null)?.questions ?? []).map((question) => (
        <div key={question.id}>
          <strong>{question.prompt}</strong>
          <p className="muted">
            {answers?.find((answer) => answer.questionId === question.id)?.value.join(", ") ||
              "No answer recorded"}
          </p>
        </div>
      ))}
    </article>
  );
}

export function ApplicationResponses({
  steps,
  responses
}: {
  steps: Data["steps"];
  responses: Response[];
}) {
  if (!steps.length)
    return (
      <section className="panel">
        <p className="muted">This job posting has no additional application steps.</p>
      </section>
    );
  const byStep = new Map(responses.map((response) => [response.stepId, response]));
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {steps.map((step, index) => (
        <StepResponse key={step.id} step={step} response={byStep.get(step.id)} index={index} />
      ))}
    </section>
  );
}
