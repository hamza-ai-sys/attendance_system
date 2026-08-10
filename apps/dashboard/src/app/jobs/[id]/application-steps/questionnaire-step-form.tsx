"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { addJobStep, type StepFormState } from "../../steps-actions";
import type { JobStepQuestion, QuestionType } from "../../step-types";

const initialState: StepFormState = {};

let questionCounter = 0;
function newQuestionId() {
  questionCounter += 1;
  return `q${Date.now()}${questionCounter}`;
}

function blankQuestion(): JobStepQuestion {
  return { id: newQuestionId(), prompt: "", type: "TEXT" };
}

export function QuestionnaireStepForm({
  jobPostingId,
  onAdded
}: {
  jobPostingId: string;
  onAdded: () => void;
}) {
  const [state, formAction, isPending] = useActionState(addJobStep, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [questions, setQuestions] = useState<JobStepQuestion[]>([blankQuestion()]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setQuestions([blankQuestion()]);
      onAdded();
    }
  }, [state.success]);

  function updateQuestion(id: string, patch: Partial<JobStepQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, blankQuestion()]);
  }

  function setQuestionType(id: string, type: QuestionType) {
    updateQuestion(id, {
      type,
      options: type === "MULTIPLE_CHOICE" ? ["", ""] : undefined,
      allowMultiple: type === "MULTIPLE_CHOICE" ? false : undefined
    });
  }

  function updateOption(questionId: string, index: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        const options = [...q.options];
        options[index] = value;
        return { ...q, options };
      })
    );
  }

  function addOption(questionId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId && q.options ? { ...q, options: [...q.options, ""] } : q
      )
    );
  }

  function removeOption(questionId: string, index: number) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        return { ...q, options: q.options.filter((_, i) => i !== index) };
      })
    );
  }

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
        <input type="hidden" name="type" value="QUESTIONNAIRE" />
        <input type="hidden" name="questionsJson" value={JSON.stringify(questions)} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {questions.map((question, qIndex) => (
            <div key={question.id} className="panel" style={{ cursor: "default", padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "8px",
                  marginBottom: "12px"
                }}
              >
                <strong>Question {qIndex + 1}</strong>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="back-link"
                    style={{
                      cursor: "pointer",
                      background: "none",
                      color: "#f87171",
                      padding: "4px 10px",
                      fontSize: "0.8rem"
                    }}
                    onClick={() => removeQuestion(question.id)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Prompt *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. How many years of React experience do you have?"
                  value={question.prompt}
                  onChange={(e) => updateQuestion(question.id, { prompt: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Answer Type</label>
                <select
                  className="form-control"
                  value={question.type}
                  onChange={(e) => setQuestionType(question.id, e.target.value as QuestionType)}
                >
                  <option value="TEXT">Text Answer</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                </select>
              </div>

              {question.type === "MULTIPLE_CHOICE" && (
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.9rem",
                      marginBottom: "10px"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={question.allowMultiple ?? false}
                      onChange={(e) =>
                        updateQuestion(question.id, { allowMultiple: e.target.checked })
                      }
                    />
                    Allow selecting more than one option
                  </label>

                  {(question.options ?? []).map((option, oIndex) => (
                    <div key={oIndex} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                        required
                      />
                      {(question.options?.length ?? 0) > 2 && (
                        <button
                          type="button"
                          className="back-link"
                          style={{
                            cursor: "pointer",
                            background: "none",
                            padding: "6px 10px",
                            fontSize: "0.8rem"
                          }}
                          onClick={() => removeOption(question.id, oIndex)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="back-link"
                    style={{ cursor: "pointer", background: "none", fontSize: "0.8rem" }}
                    onClick={() => addOption(question.id)}
                  >
                    + Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "16px" }}>
          <button
            type="button"
            className="back-link"
            style={{ cursor: "pointer" }}
            onClick={addQuestion}
          >
            + Add Question
          </button>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? "Adding..." : "Add Step"}
          </button>
        </div>
      </form>
    </div>
  );
}
