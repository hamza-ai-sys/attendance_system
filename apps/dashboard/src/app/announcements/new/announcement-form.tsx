"use client";

import { useActionState, useRef, useEffect } from "react";
import { createAnnouncement } from "../actions";
import type { AnnouncementActionState } from "../types";

const initialState: AnnouncementActionState = {};

export function AnnouncementForm() {
  const [state, formAction, isPending] = useActionState(createAnnouncement, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="form-panel">
      <div>
        <h2>New Announcement</h2>
        <p className="muted">This will be visible to every employee on the Announcements page.</p>
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
      >
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            className="form-control"
            placeholder="e.g. Updated Work-From-Home Policy"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Details *</label>
          <textarea
            id="content"
            name="content"
            className="form-control"
            placeholder="Write the full notice or policy update here."
            rows={8}
            required
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        <div style={{ marginTop: "4px" }}>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? "Posting..." : "Post Announcement"}
          </button>
        </div>
      </form>
    </div>
  );
}
