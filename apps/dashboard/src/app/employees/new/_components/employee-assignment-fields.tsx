import type { EmployeeManagerOption, EmployeeRoleOption } from "../../types";

export function EmployeeAssignmentFields({
  managers,
  roles
}: {
  managers: EmployeeManagerOption[];
  roles: EmployeeRoleOption[];
}) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="roleId">Role *</label>
        <select id="roleId" name="roleId" className="form-control" defaultValue="" required>
          <option value="" disabled>
            Select Employee Role
          </option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="supervisorId">Reports To (Supervisor / Lead)</label>
        <select id="supervisorId" name="supervisorId" className="form-control" defaultValue="">
          <option value="">None / Top Level</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.fullName} ({manager.email})
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
