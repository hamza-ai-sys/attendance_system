"use client";

import type { EmailCvStepConfig } from "../../step-types";

export function EmailCvApplyStep({
  step,
  index
}: {
  step: { id: string; config: unknown };
  index: number;
}) {
  const config = step.config as EmailCvStepConfig | null;

  return (
    <div className="panel" style={{ cursor: "default" }}>
      <h3>Step {index + 1}: Email Your CV</h3>
      <p className="muted" style={{ marginTop: "6px" }}>
        Please send your CV to <strong>{config?.email}</strong>
        {config?.instructions ? ` — ${config.instructions}` : ""}
      </p>
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          marginTop: "12px",
          fontSize: "0.9rem"
        }}
      >
        <input type="checkbox" name={`ack_${step.id}`} required style={{ marginTop: "3px" }} />
        <span>I confirm I have emailed my CV to the address above.</span>
      </label>
    </div>
  );
}
