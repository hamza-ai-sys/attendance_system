"use client";

import type { QuestionnaireStepConfig } from "../../step-types";

type Question = QuestionnaireStepConfig["questions"][number];

function QuestionnaireField({
  question,
  number,
  fieldName
}: {
  question: Question;
  number: number;
  fieldName: string;
}) {
  if (question.type === "TEXT")
    return (
      <div className="form-group">
        <label>
          {number}. {question.prompt} *
        </label>
        <input name={fieldName} className="form-control" required />
      </div>
    );
  return (
    <div className="form-group">
      <label>
        {number}. {question.prompt} *
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(question.options ?? []).map((option, index) => (
          <label key={index} style={{ display: "flex", gap: 8 }}>
            <input
              type={question.allowMultiple ? "checkbox" : "radio"}
              name={fieldName}
              value={option}
              required={!question.allowMultiple}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

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
        {questions.map((question, index) => (
          <QuestionnaireField
            key={question.id}
            question={question}
            number={index + 1}
            fieldName={`q_${step.id}_${question.id}`}
          />
        ))}
      </div>
    </div>
  );
}
