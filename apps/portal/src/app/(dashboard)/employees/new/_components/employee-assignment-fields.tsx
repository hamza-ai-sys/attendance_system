import type { EmployeeManagerOption, OrganizationUnitOption, PositionOption } from "../../types";

export function EmployeeAssignmentFields({
  managers,
  organizationUnits,
  positions
}: {
  managers: EmployeeManagerOption[];
  organizationUnits: OrganizationUnitOption[];
  positions: PositionOption[];
}) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="organizationUnitId">Organization Unit *</label>
        <select
          id="organizationUnitId"
          name="organizationUnitId"
          className="form-control"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select Department or Team
          </option>
          {organizationUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="positionId">Position *</label>
        <select id="positionId" name="positionId" className="form-control" defaultValue="" required>
          <option value="" disabled>
            Select Position
          </option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.title}
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
