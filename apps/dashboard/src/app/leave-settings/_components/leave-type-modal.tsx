import type { FormEvent } from "react";

const fieldStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  background: "rgba(255,255,255,.05)",
  border: "1px solid var(--border)",
  color: "#fff"
};

function TextField({
  label,
  name,
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
      {label}
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        style={{ ...fieldStyle, marginTop: 4 }}
      />
    </label>
  );
}

function PolicyFields() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>
          Accrual Frequency
          <select name="accrualFrequency" style={{ ...fieldStyle, background: "#1e293b" }}>
            <option value="MONTHLY">Monthly Accrual</option>
            <option value="ANNUALLY">Annual Allotment</option>
          </select>
        </label>
        <label>
          Annual Quota (Days)
          <input
            type="number"
            name="defaultAllocation"
            step="0.5"
            min="0"
            defaultValue="10"
            required
            style={fieldStyle}
          />
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>
          Allow Carry Forward?
          <select name="allowCarryForward" style={{ ...fieldStyle, background: "#1e293b" }}>
            <option value="false">No (Expires annually)</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <label>
          Max Carry Days
          <input
            type="number"
            name="maxCarryForwardDays"
            min="0"
            defaultValue="0"
            style={fieldStyle}
          />
        </label>
      </div>
      <label>
        Pay Type
        <select name="isPaid" style={{ ...fieldStyle, background: "#1e293b" }}>
          <option value="true">Paid Leave</option>
          <option value="false">Unpaid Leave (LOP)</option>
        </select>
      </label>
    </>
  );
}

export function LeaveTypeModal({
  error,
  loading,
  onClose,
  onSubmit
}: {
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100
      }}
    >
      <div
        style={{
          background: "var(--panel-bg,#1e293b)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 28,
          maxWidth: 500,
          width: "100%"
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: "1.3rem" }}>Add Custom Leave Category</h3>
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,.15)",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,.3)",
              borderRadius: 6,
              padding: "10px 14px"
            }}
          >
            {error}
          </div>
        )}
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}
        >
          <TextField
            label="Category Name *"
            name="name"
            placeholder="e.g. Study Leave, Paternity Leave"
            required
          />
          <TextField label="Category Code *" name="code" placeholder="e.g. STUDY_LEAVE" required />
          <TextField
            label="Description"
            name="description"
            placeholder="Short description of this leave policy"
          />
          <PolicyFields />
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" onClick={onClose} className="logout-btn">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                border: 0,
                color: "#fff",
                fontWeight: 600
              }}
            >
              {loading ? "Creating..." : "Save Leave Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
