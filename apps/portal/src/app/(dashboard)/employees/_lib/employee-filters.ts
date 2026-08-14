import type { EmployeeRecord } from "../types";

export function filterEmployees(
  employees: EmployeeRecord[],
  searchTerm: string,
  roleFilter: string
): EmployeeRecord[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedRole = roleFilter.toLowerCase();

  return employees.filter((employee) => {
    const matchesSearch =
      employee.fullName.toLowerCase().includes(normalizedSearch) ||
      employee.email.toLowerCase().includes(normalizedSearch) ||
      Boolean(employee.employeeCode?.toLowerCase().includes(normalizedSearch));
    const matchesRole =
      normalizedRole === "all" || employee.roleName.toLowerCase() === normalizedRole;
    return matchesSearch && matchesRole;
  });
}

export function countEmployeesByRole(employees: EmployeeRecord[]): Record<string, number> {
  return employees.reduce<Record<string, number>>((counts, employee) => {
    const roleName = employee.roleName.toLowerCase();
    counts[roleName] = (counts[roleName] || 0) + 1;
    return counts;
  }, {});
}
