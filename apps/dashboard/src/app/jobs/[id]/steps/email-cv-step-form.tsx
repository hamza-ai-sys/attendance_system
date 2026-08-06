"use client";

import { useActionState, useRef, useEffect } from "react";
import { addJobStep, type StepFormState } from "../../steps-actions";

const initialState: StepFormState = {};

export function EmailCvStepForm({
  jobPostingId,
  onAdded
}: {
  jobPostingId: string;
  onAdded: () => void;
}) {
  const [state, formAction, isPending] = useActionState(addJobStep, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onAdded();
    }
  }, [state.success]);

  return (
    <div
      style={{
        borderTop: "1px solid rgba(148, 163, 184, 0.2)",
        paddingTop: "16px",
        marginTop: "8px"
      }}
    >
      {state.error && (
        <div className="alert-error" role="alert">
          ⚠️ {state.error}
        </div>
      )}

      <form ref={formRef} action={formAction}>
        <input type="hidden" name="jobPostingId" value={jobPostingId} />
        <input type="hidden" name="type" value="EMAIL_CV" />

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="email">CV Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="e.g. hiring@company.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Instructions (optional)</label>
          <textarea
            id="instructions"
            name="instructions"
            className="form-control"
            placeholder="e.g. Please use the subject line 'Application - [Your Name]'"
            rows={3}
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Adding..." : "Add Step"}
        </button>
      </form>
    </div>
  );
}
