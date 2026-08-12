"use client";

import { useActionState } from "react";
import { updatePersonalRecords, type PersonalRecordsState } from "./actions";

type PersonalRecordsData = {
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

const initialState: PersonalRecordsState = {};
const readOnlyStyle = { opacity: 0.7, cursor: "not-allowed", background: "rgba(255,255,255,0.02)" };

function StaffProfileFields({ data }: { data: PersonalRecordsData }) {
  const fields = [
    ["Full Name", data.fullName, "text"],
    ["Email Address", data.email, "email"],
    ["Employee Code", data.employeeCode || "N/A", "text"],
    ["Assigned Role", data.roleName, "text"]
  ];
  return (
    <section style={{ borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
      <h3 style={{ color: "#60a5fa" }}>Staff Profile (Read-only)</h3>
      <div className="form-grid">
        {fields.map(([label, value, type]) => (
          <div className="form-group" key={label}>
            <label>{label}</label>
            <input
              type={type}
              className="form-control"
              value={value}
              readOnly
              style={readOnlyStyle}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function BioDataFields({ data }: { data: PersonalRecordsData }) {
  return (
    <section style={{ borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
      <h3 style={{ color: "#c084fc" }}>Bio-data</h3>
      <div className="form-grid">
        <label>
          Date of Birth
          <input
            name="dateOfBirth"
            type="date"
            className="form-control"
            defaultValue={data.dateOfBirth || ""}
          />
        </label>
        <label>
          Gender
          <select name="gender" className="form-control" defaultValue={data.gender || ""}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Marital Status
          <select
            name="maritalStatus"
            className="form-control"
            defaultValue={data.maritalStatus || ""}
          >
            <option value="">Select Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function ContactFields({ data }: { data: PersonalRecordsData }) {
  return (
    <section style={{ borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
      <h3 style={{ color: "#8b5cf6" }}>Contact Details</h3>
      <div className="form-grid">
        <label>
          Phone Number
          <input name="phone" type="tel" className="form-control" defaultValue={data.phone || ""} />
        </label>
        <label>
          Current Address
          <input
            name="currentAddress"
            className="form-control"
            defaultValue={data.currentAddress || ""}
          />
        </label>
        <label>
          Permanent Address
          <input
            name="permanentAddress"
            className="form-control"
            defaultValue={data.permanentAddress || ""}
          />
        </label>
      </div>
    </section>
  );
}

function EmergencyContactFields({ data }: { data: PersonalRecordsData }) {
  return (
    <section>
      <h3 style={{ color: "#f43f5e" }}>Emergency Contact Information</h3>
      <div className="form-grid">
        <label>
          Contact Name
          <input
            name="emergencyContactName"
            className="form-control"
            defaultValue={data.emergencyContactName || ""}
          />
        </label>
        <label>
          Contact Phone
          <input
            name="emergencyContactPhone"
            type="tel"
            className="form-control"
            defaultValue={data.emergencyContactPhone || ""}
          />
        </label>
      </div>
    </section>
  );
}

export function PersonalRecordsForm({ initialData }: { initialData: PersonalRecordsData }) {
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
      <StaffProfileFields data={initialData} />
      <BioDataFields data={initialData} />
      <ContactFields data={initialData} />
      <EmergencyContactFields data={initialData} />
      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? "Saving changes..." : "Save Personal Records"}
      </button>
    </form>
  );
}
