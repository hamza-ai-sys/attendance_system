import type { EmployeeRecord } from "../types";

function EmployeeRow({ employee }: { employee: EmployeeRecord }) {
  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{employee.fullName}</td>
      <td>{employee.email}</td>
      <td className="muted">{employee.employeeCode || "-"}</td>
      <td>
        <span className={`role-badge ${employee.roleName.toLowerCase() || "employee"}`}>
          {employee.roleName}
        </span>
      </td>
      <td className="muted">{employee.managerName}</td>
      <td className="muted" style={{ fontSize: "0.85rem" }}>
        {employee.timezone}
      </td>
      <td>
        <span
          style={{
            color: employee.status === "ACTIVE" ? "#34d399" : "#fca5a5",
            fontSize: "0.85rem",
            fontWeight: 600
          }}
        >
          ● {employee.status}
        </span>
      </td>
    </tr>
  );
}

export function EmployeeTable({ employees }: { employees: EmployeeRecord[] }) {
  return (
    <div className="attendance-table-container">
      <table className="directory-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Employee Code</th>
            <th>Role</th>
            <th>Reports To</th>
            <th>Timezone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => <EmployeeRow key={employee.id} employee={employee} />)
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                No employees found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
