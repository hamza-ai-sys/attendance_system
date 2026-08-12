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

interface QuestionEditorProps {
  question: JobStepQuestion;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<JobStepQuestion>) => void;
  onRemove: () => void;
  onOptionChange: (index: number, value: string) => void;
  onOptionAdd: () => void;
  onOptionRemove: (index: number) => void;
}

function QuestionOptions({
  question,
  onChange,
  onAdd,
  onRemove
}: {
  question: JobStepQuestion;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={question.allowMultiple ?? false}
          onChange={(event) => onChange(-1, String(event.target.checked))}
        />{" "}
        Allow selecting more than one option
      </label>
      {(question.options ?? []).map((option, index) => (
        <div key={index} style={{ display: "flex", gap: 8 }}>
          <input
            className="form-control"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(event) => onChange(index, event.target.value)}
            required
          />
          {(question.options?.length ?? 0) > 2 && (
            <button type="button" className="back-link" onClick={() => onRemove(index)}>
              ✕
            </button>
          )}
        </div>
      ))}
      <button type="button" className="back-link" onClick={onAdd}>
        + Add Option
      </button>
    </div>
  );
}

function QuestionEditor({
  question,
  index,
  canRemove,
  onChange,
  onRemove,
  onOptionChange,
  onOptionAdd,
  onOptionRemove
}: QuestionEditorProps) {
  function handleOption(index: number, value: string) {
    if (index === -1) onChange({ allowMultiple: value === "true" });
    else onOptionChange(index, value);
  }
  return (
    <div className="panel" style={{ cursor: "default", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Question {index + 1}</strong>
        {canRemove && (
          <button type="button" className="back-link" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      <div className="form-group">
        <label>Question Prompt *</label>
        <input
          className="form-control"
          value={question.prompt}
          onChange={(event) => onChange({ prompt: event.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Answer Type</label>
        <select
          className="form-control"
          value={question.type}
          onChange={(event) =>
            onChange({
              type: event.target.value as QuestionType,
              options: event.target.value === "MULTIPLE_CHOICE" ? ["", ""] : undefined,
              allowMultiple: false
            })
          }
        >
          <option value="TEXT">Text Answer</option>
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
        </select>
      </div>
      {question.type === "MULTIPLE_CHOICE" && (
        <QuestionOptions
          question={question}
          onChange={handleOption}
          onAdd={onOptionAdd}
          onRemove={onOptionRemove}
        />
      )}
    </div>
  );
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
          {questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              canRemove={questions.length > 1}
              onChange={(patch) => updateQuestion(question.id, patch)}
              onRemove={() => removeQuestion(question.id)}
              onOptionChange={(optionIndex, value) => updateOption(question.id, optionIndex, value)}
              onOptionAdd={() => addOption(question.id)}
              onOptionRemove={(optionIndex) => removeOption(question.id, optionIndex)}
            />
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
