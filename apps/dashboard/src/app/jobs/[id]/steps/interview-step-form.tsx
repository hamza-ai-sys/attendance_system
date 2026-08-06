"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { addJobStep, type StepFormState } from "../../steps-actions";

const initialState: StepFormState = {};

export function InterviewStepForm({
  jobPostingId,
  employees,
  onAdded
}: {
  jobPostingId: string;
  employees: { id: string; fullName: string }[];
  onAdded: () => void;
}) {
  const [state, formAction, isPending] = useActionState(addJobStep, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"ONLINE" | "PHYSICAL">("ONLINE");

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setMode("ONLINE");
      onAdded();
    }
  }, [state.success]);

  const todayStr = new Date().toISOString().slice(0, 10);

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
        <input type="hidden" name="type" value="INTERVIEW" />

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="interviewMode">Interview Type *</label>
            <select
              id="interviewMode"
              name="interviewMode"
              className="form-control"
              value={mode}
              onChange={(e) => setMode(e.target.value as "ONLINE" | "PHYSICAL")}
            >
              <option value="ONLINE">Online</option>
              <option value="PHYSICAL">Physical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="interviewerId">Interviewer (Faculty) *</label>
            <select
              id="interviewerId"
              name="interviewerId"
              className="form-control"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Choose an employee
              </option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </div>

          {mode === "PHYSICAL" && (
            <div className="form-group">
              <label htmlFor="location">Interview Location *</label>
              <input
                id="location"
                name="location"
                type="text"
                className="form-control"
                placeholder="e.g. Head Office, 3rd Floor Conference Room"
                required
              />
            </div>
          )}
        </div>

        <p className="muted" style={{ fontSize: "0.85rem", marginTop: "8px" }}>
          Candidates will pick a 30-minute slot within the window below. Weekends are excluded
          automatically.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="availabilityStart">Available From *</label>
            <input
              id="availabilityStart"
              name="availabilityStart"
              type="date"
              className="form-control"
              min={todayStr}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="availabilityEnd">Available Until *</label>
            <input
              id="availabilityEnd"
              name="availabilityEnd"
              type="date"
              className="form-control"
              min={todayStr}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dailyStartTime">Daily Start Time *</label>
            <input
              id="dailyStartTime"
              name="dailyStartTime"
              type="time"
              className="form-control"
              defaultValue="09:00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dailyEndTime">Daily End Time *</label>
            <input
              id="dailyEndTime"
              name="dailyEndTime"
              type="time"
              className="form-control"
              defaultValue="17:00"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isPending}
          style={{ marginTop: "8px" }}
        >
          {isPending ? "Adding..." : "Add Step"}
        </button>
      </form>
    </div>
  );
}
