"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitApplication } from "../actions";
import type { ApplicationState, ApplyStep } from "../types";
import { EmailCvApplyStep } from "./apply-steps/email-cv-apply-step";
import { QuestionnaireApplyStep } from "./apply-steps/questionnaire-apply-step";
import { InterviewApplyStep } from "./apply-steps/interview-apply-step";

const initialState: ApplicationState = {};

function ApplicantFields() {
  return (
    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="fullName">Full Name *</label>
        <input
          id="fullName"
          name="fullName"
          className="form-control"
          placeholder="e.g. Jane Doe"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone Number *</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="form-control"
          placeholder="e.g. +92 300 1234567"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-control"
          placeholder="e.g. jane@example.com"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="cv">CV / Resume *</label>
        <input
          id="cv"
          name="cv"
          type="file"
          className="form-control"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
        />
        <span className="muted">PDF or Word document, up to 5MB.</span>
      </div>
    </div>
  );
}

function ApplicationSteps({ steps }: { steps: ApplyStep[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {steps.map((step, index) => {
        if (step.type === "EMAIL_CV")
          return <EmailCvApplyStep key={step.id} step={step} index={index} />;
        if (step.type === "QUESTIONNAIRE")
          return <QuestionnaireApplyStep key={step.id} step={step} index={index} />;
        if (step.type === "INTERVIEW")
          return <InterviewApplyStep key={step.id} step={step} index={index} />;
        return null;
      })}
    </div>
  );
}

export function ApplyForm({ jobPostingId, steps }: { jobPostingId: string; steps: ApplyStep[] }) {
  const [state, formAction, isPending] = useActionState(submitApplication, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="form-panel">
      <div>
        <h2>Apply for this Position</h2>
        <p className="muted">
          Fill in your details and complete every step below to submit your application.
        </p>
      </div>

      {state.error && (
        <div className="alert-error" role="alert">
          ⚠️ {state.error}
        </div>
      )}

      {state.success && (
        <div className="alert-success" role="status">
          ✅ {state.success}
        </div>
      )}

      <form
        ref={formRef}
        action={formAction}
        className="form-panel"
        style={{ padding: 0, border: "none", boxShadow: "none" }}
        encType="multipart/form-data"
      >
        <input type="hidden" name="jobPostingId" value={jobPostingId} />

        <ApplicantFields />
        {steps.length > 0 && <ApplicationSteps steps={steps} />}

        <div style={{ marginTop: "4px" }}>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}
