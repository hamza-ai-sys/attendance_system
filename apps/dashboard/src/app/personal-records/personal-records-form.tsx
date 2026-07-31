"use client";

import { useActionState } from "react";
import { updatePersonalRecords, type PersonalRecordsState } from "./actions";

interface PersonalRecordsFormProps {
  initialData: {
    fullName: string;
    email: string;
    employeeCode: string | null;
    roleName: string;
    phone: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    maritalStatus: string | null;
    currentAddress: string | null;
    permanentAddress: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  };
}

const initialState: PersonalRecordsState = {};

export function PersonalRecordsForm({ initialData }: PersonalRecordsFormProps) {
  const [state, formAction, isPending] = useActionState(updatePersonalRecords, initialState);

  return (
    <form action={formAction} className="form-panel" style={{ gap: "24px" }}>
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

      {/* Profile/Staff Details Section (Read-only) */}
      <section style={{ borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#60a5fa" }}>Staff Profile (Read-only)</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              value={initialData.fullName}
              readOnly
              style={{ opacity: 0.7, cursor: "not-allowed", background: "rgba(255,255,255,0.02)" }}
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={initialData.email}
              readOnly
              style={{ opacity: 0.7, cursor: "not-allowed", background: "rgba(255,255,255,0.02)" }}
            />
          </div>
          <div className="form-group">
            <label>Employee Code</label>
            <input
              type="text"
              className="form-control"
              value={initialData.employeeCode || "N/A"}
              readOnly
              style={{ opacity: 0.7, cursor: "not-allowed", background: "rgba(255,255,255,0.02)" }}
            />
          </div>
          <div className="form-group">
            <label>Assigned Role</label>
            <input
              type="text"
              className="form-control"
              value={initialData.roleName}
              readOnly
              style={{ opacity: 0.7, cursor: "not-allowed", background: "rgba(255,255,255,0.02)" }}
            />
          </div>
        </div>
      </section>

      {/* Bio-data Section */}
      <section style={{ borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#c084fc" }}>Bio-data</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              className="form-control"
              defaultValue={initialData.dateOfBirth || ""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              className="form-control"
              defaultValue={initialData.gender || ""}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="maritalStatus">Marital Status</label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              className="form-control"
              defaultValue={initialData.maritalStatus || ""}
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Contact Details Section */}
      <section style={{ borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#8b5cf6" }}>Contact Details</h3>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: "span 1" }}>
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-control"
              placeholder="e.g. +92 300 1234567"
              defaultValue={initialData.phone || ""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentAddress">Current Address</label>
            <input
              id="currentAddress"
              name="currentAddress"
              type="text"
              className="form-control"
              placeholder="Current residential address"
              defaultValue={initialData.currentAddress || ""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="permanentAddress">Permanent Address</label>
            <input
              id="permanentAddress"
              name="permanentAddress"
              type="text"
              className="form-control"
              placeholder="Permanent address (if different)"
              defaultValue={initialData.permanentAddress || ""}
            />
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section style={{ paddingBottom: "10px" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#f43f5e" }}>Emergency Contact Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="emergencyContactName">Contact Name</label>
            <input
              id="emergencyContactName"
              name="emergencyContactName"
              type="text"
              className="form-control"
              placeholder="Full Name of contact person"
              defaultValue={initialData.emergencyContactName || ""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="emergencyContactPhone">Contact Phone</label>
            <input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="tel"
              className="form-control"
              placeholder="Phone number of contact person"
              defaultValue={initialData.emergencyContactPhone || ""}
            />
          </div>
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Saving changes..." : "Save Personal Records"}
        </button>
      </div>
    </form>
  );
}
