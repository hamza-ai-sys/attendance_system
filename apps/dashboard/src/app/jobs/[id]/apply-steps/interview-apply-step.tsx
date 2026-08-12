"use client";

import { useState, useEffect } from "react";
import { getAvailableInterviewSlots } from "../../steps-actions";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function TimeSlots({
  slots,
  selected,
  loading,
  error,
  fieldName,
  onSelect
}: {
  slots: string[];
  selected: string;
  loading: boolean;
  error: string | null;
  fieldName: string;
  onSelect: (slot: string) => void;
}) {
  if (loading) return <p className="muted">Loading available times...</p>;
  if (error) return <p className="muted">{error}</p>;
  if (!slots.length)
    return <p className="muted">No available times on this date. Please try another date.</p>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {slots.map((slot) => (
        <label
          key={slot}
          style={{
            border: selected === slot ? "1px solid #c084fc" : "1px solid rgba(148,163,184,.3)",
            background: selected === slot ? "rgba(139,92,246,.15)" : "transparent",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: "pointer"
          }}
        >
          <input
            type="radio"
            name={fieldName}
            value={slot}
            checked={selected === slot}
            onChange={() => onSelect(slot)}
            required
            style={{ display: "none" }}
          />
          {slot}
        </label>
      ))}
    </div>
  );
}

export function InterviewApplyStep({
  step,
  index
}: {
  step: {
    id: string;
    interviewMode: string | null;
    location: string | null;
    availabilityStart: Date | null;
    availabilityEnd: Date | null;
    interviewer: { fullName: string } | null;
  };
  index: number;
}) {
  const minDate = step.availabilityStart
    ? toDateInputValue(new Date(step.availabilityStart))
    : undefined;
  const maxDate = step.availabilityEnd
    ? toDateInputValue(new Date(step.availabilityEnd))
    : undefined;

  const [selectedDate, setSelectedDate] = useState(minDate ?? "");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setSelectedTime("");

    getAvailableInterviewSlots(step.id, selectedDate)
      .then((result) => {
        if (cancelled) return;
        setSlots(result.slots);
        if (result.error) setLoadError(result.error);
      })
      .catch(() => {
        if (!cancelled)
          setLoadError("Could not load available times. Please try a different date.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, step.id]);

  return (
    <div className="panel" style={{ cursor: "default" }}>
      <h3>Step {index + 1}: Interview Scheduling</h3>
      <p className="muted" style={{ marginTop: "6px" }}>
        {step.interviewMode === "ONLINE"
          ? "Online interview"
          : `Physical interview — ${step.location ?? "location TBD"}`}
        {step.interviewer ? ` with ${step.interviewer.fullName}` : ""}. Duration: 30 minutes.
      </p>

      <div className="form-grid" style={{ marginTop: "12px" }}>
        <div className="form-group">
          <label htmlFor={`interview_${step.id}_date`}>Choose a Date *</label>
          <input
            id={`interview_${step.id}_date`}
            name={`interview_${step.id}_date`}
            type="date"
            className="form-control"
            min={minDate}
            max={maxDate}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div style={{ marginTop: "12px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Choose a Time *</label>

        <TimeSlots
          slots={slots}
          selected={selectedTime}
          loading={isLoading}
          error={loadError}
          fieldName={`interview_${step.id}_time`}
          onSelect={setSelectedTime}
        />
      </div>
    </div>
  );
}
