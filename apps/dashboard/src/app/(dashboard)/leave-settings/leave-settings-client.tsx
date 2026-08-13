"use client";

import { useState, type FormEvent } from "react";
import { LeaveTypeModal } from "./_components/leave-type-modal";
import { LeaveTypesTable } from "./_components/leave-types-table";
import { createLeaveType, toggleLeaveTypeStatus } from "./actions";
import type { LeaveTypeItem } from "./types";

export function LeaveSettingsClient({ leaveTypes }: { leaveTypes: LeaveTypeItem[] }) {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createLeaveType(new FormData(event.currentTarget));
    setLoading(false);
    if (result?.error) setError(result.error);
    else setShowModal(false);
  }

  function openModal() {
    setError(null);
    setShowModal(true);
  }

  return (
    <section className="panel" style={{ cursor: "default" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}
      >
        <div>
          <h2>Organization Leave Categories ({leaveTypes.length})</h2>
          <p className="muted">
            Define leave structures, default quotas, and accrual frequencies for your employees.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          style={{
            background: "linear-gradient(135deg,#3b82f6,#2563eb)",
            color: "#fff",
            border: 0,
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          + Add Custom Leave Type
        </button>
      </div>
      <LeaveTypesTable
        leaveTypes={leaveTypes}
        onToggle={(leaveType) => void toggleLeaveTypeStatus(leaveType.id, !leaveType.isActive)}
      />
      {showModal && (
        <LeaveTypeModal
          error={error}
          loading={loading}
          onClose={() => setShowModal(false)}
          onSubmit={(event) => void handleCreate(event)}
        />
      )}
    </section>
  );
}
