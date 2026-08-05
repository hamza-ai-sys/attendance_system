"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitApplication, type ApplicationState } from "../actions";

const initialState: ApplicationState = {};

export function ApplyForm({ jobPostingId }: { jobPostingId: string }) {
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
        <p className="muted">Fill in your details and attach your CV to submit your application.</p>
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

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
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
            <span className="muted" style={{ fontSize: "0.8rem" }}>
              PDF or Word document, up to 5MB.
            </span>
          </div>
        </div>

        <div style={{ marginTop: "4px" }}>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}
