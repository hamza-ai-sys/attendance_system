"use client";

import type { QuestionnaireStepConfig } from "../../step-types";

export function QuestionnaireApplyStep({
  step,
  index
}: {
  step: { id: string; config: unknown };
  index: number;
}) {
  const config = step.config as QuestionnaireStepConfig | null;
  const questions = config?.questions ?? [];

  return (
    <div className="panel" style={{ cursor: "default" }}>
      <h3>Step {index + 1}: Questionnaire</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
        {questions.map((question, qIndex) => {
          const fieldName = `q_${step.id}_${question.id}`;

          return (
            <div key={question.id} className="form-group">
              <label>
                {qIndex + 1}. {question.prompt} *
              </label>

              {question.type === "TEXT" && (
                <input type="text" name={fieldName} className="form-control" required />
              )}

              {question.type === "MULTIPLE_CHOICE" && !question.allowMultiple && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}
                >
                  {(question.options ?? []).map((option, oIndex) => (
                    <label
                      key={oIndex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.9rem"
                      }}
                    >
                      <input type="radio" name={fieldName} value={option} required />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.type === "MULTIPLE_CHOICE" && question.allowMultiple && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}
                >
                  {(question.options ?? []).map((option, oIndex) => (
                    <label
                      key={oIndex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.9rem"
                      }}
                    >
                      <input type="checkbox" name={fieldName} value={option} />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
