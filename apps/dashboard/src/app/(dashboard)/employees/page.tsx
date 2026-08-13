import { UnauthorizedView } from "../../../components/unauthorized-view";
import { requireCurrentUser } from "../../../lib/session";
import { EmployeeDirectory } from "./_components/employee-directory";
import { EmployeesHeader } from "./_components/employees-header";
import { canCreateEmployees, canViewEmployees } from "./permissions";
import { getEmployeeRecords } from "./queries";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const user = await requireCurrentUser();
  if (!canViewEmployees(user)) return <UnauthorizedView featureName="Employee Directory" />;

  const employees = await getEmployeeRecords(user.organizationId);

  return (
    <main className="app-shell">
      <EmployeesHeader
        title="Employees"
        subtitle={`${employees.length} registered employees`}
        showAddEmployee={canCreateEmployees(user)}
      />
      <EmployeeDirectory employees={employees} />
    </main>
  );
}
