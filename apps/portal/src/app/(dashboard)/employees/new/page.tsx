import { UnauthorizedView } from "../../../../components/unauthorized-view";
import { requireCurrentUser } from "../../../../lib/session";
import { EmployeesHeader } from "../_components/employees-header";
import { canCreateEmployees } from "../permissions";
import { getEmployeeFormOptions } from "../queries";
import { EmployeeForm } from "./_components/employee-form";

export const dynamic = "force-dynamic";

export default async function NewEmployeePage() {
  const user = await requireCurrentUser();
  if (!canCreateEmployees(user)) return <UnauthorizedView featureName="Add Employee" />;

  const { managers, organizationUnits, positions } = await getEmployeeFormOptions(
    user.organizationId
  );

  return (
    <main className="app-shell">
      <EmployeesHeader
        title="Add Employee"
        subtitle={`Adding an employee as ${user.fullName} (${user.roleName})`}
      />
      <EmployeeForm
        managers={managers}
        organizationUnits={organizationUnits}
        positions={positions}
      />
    </main>
  );
}
