"use client";

import { useState } from "react";
import { createPerformanceTemplate, type FieldDefinition } from "./actions";

const initialFields: FieldDefinition[] = [
  { id: "f_1", label: "Technical & Job Knowledge", type: "rating", required: true },
  { id: "f_2", label: "Team Collaboration & Communication", type: "rating", required: true },
  { id: "f_3", label: "Punctuality & Reliability", type: "rating", required: true },
  { id: "f_4", label: "Key Achievements & Comments", type: "text", required: false }
];

function TemplateFieldEditor({
  field,
  index,
  onRemove,
  onUpdate
}: {
  field: FieldDefinition;
  index: number;
  onRemove: () => void;
  onUpdate: (patch: Partial<FieldDefinition>) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 2fr 1fr auto", gap: "10px" }}>
      <strong>#{index + 1}</strong>
      <input
        value={field.label}
        onChange={(event) => onUpdate({ label: event.target.value })}
        required
      />
      <select
        value={field.type}
        onChange={(event) => onUpdate({ type: event.target.value as FieldDefinition["type"] })}
      >
        <option value="rating">Rating (1-5)</option>
        <option value="text">Text response</option>
        <option value="number">Numeric score</option>
      </select>
      <button type="button" className="close-btn" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}

function TemplateDetails({
  description,
  endDate,
  setDescription,
  setEndDate,
  setStartDate,
  setTitle,
  startDate,
  title
}: {
  description: string;
  endDate: string;
  setDescription: (value: string) => void;
  setEndDate: (value: string) => void;
  setStartDate: (value: string) => void;
  setTitle: (value: string) => void;
  startDate: string;
  title: string;
}) {
  return (
    <>
      <label>
        Document Title *<input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Description
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <label>
          Active Start Date *
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        <label>
          Active End Date *
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </label>
      </div>
    </>
  );
}

export function PerformanceTemplateBuilder({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [fields, setFields] = useState(initialFields);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateField = (id: string, patch: Partial<FieldDefinition>) => {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, ...patch } : field))
    );
  };

  const removeField = (id: string) => {
    if (fields.length === 1) return alert("At least one field is required.");
    setFields((current) => current.filter((field) => field.id !== id));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (fields.some((field) => !field.label.trim())) {
      setMessage("Error: All form fields must have a valid label.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await createPerformanceTemplate({ title, description, startDate, endDate, fields });
      setMessage("Performance Document created successfully!");
      setTimeout(onClose, 1000);
    } catch (error: unknown) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Failed to create template"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: "750px" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Define Employee Performance Document</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        {message && <p className={message.startsWith("Error") ? "error" : "muted"}>{message}</p>}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <TemplateDetails
            {...{
              title,
              description,
              startDate,
              endDate,
              setTitle,
              setDescription,
              setStartDate,
              setEndDate
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Form Fields & Criteria</h3>
            <button
              type="button"
              className="back-link"
              onClick={() =>
                setFields((current) => [
                  ...current,
                  { id: `f_${Date.now()}`, label: "", type: "rating", required: true }
                ])
              }
            >
              ➕ Add Field
            </button>
          </div>
          {fields.map((field, index) => (
            <TemplateFieldEditor
              key={field.id}
              field={field}
              index={index}
              onRemove={() => removeField(field.id)}
              onUpdate={(patch) => updateField(field.id, patch)}
            />
          ))}
          <button type="submit" disabled={submitting} className="primary-btn">
            {submitting ? "Saving Document..." : "Save & Publish Document"}
          </button>
        </form>
      </div>
    </div>
  );
}
