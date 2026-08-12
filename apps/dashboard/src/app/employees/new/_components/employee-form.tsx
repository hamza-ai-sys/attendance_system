"use client";

import { useActionState, useEffect, useRef } from "react";
import { createEmployee } from "../actions";
import { EmployeeAssignmentFields } from "./employee-assignment-fields";
import { EmployeeIdentityFields } from "./employee-identity-fields";
import { EmployeeScheduleFields } from "./employee-schedule-fields";
import type { CreateEmployeeState, EmployeeManagerOption, EmployeeRoleOption } from "../../types";

const initialState: CreateEmployeeState = {};

export function EmployeeForm({
  managers,
  roles
}: {
  managers: EmployeeManagerOption[];
  roles: EmployeeRoleOption[];
}) {
  const [state, formAction, isPending] = useActionState(createEmployee, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="form-panel">
      <div>
        <h2>New Employee</h2>
        <p className="muted">Add a new employee and configure their access and schedule.</p>
      </div>
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
      <form
        ref={formRef}
        action={formAction}
        className="form-panel"
        style={{ padding: 0, border: 0 }}
      >
        <div className="form-grid">
          <EmployeeIdentityFields />
          <EmployeeAssignmentFields managers={managers} roles={roles} />
          <EmployeeScheduleFields />
        </div>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Adding..." : "Add Employee"}
        </button>
      </form>
    </div>
  );
}
