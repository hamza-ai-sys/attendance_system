import { describe, expect, it } from "vitest";
import { countEmployeesByRole, filterEmployees } from "./employee-filters";
import type { EmployeeRecord } from "../types";

const employees = [
  {
    id: "1",
    fullName: "Ayesha Khan",
    email: "ayesha@example.com",
    employeeCode: "EMP-1",
    roleName: "HR"
  },
  {
    id: "2",
    fullName: "Bilal Ahmed",
    email: "bilal@example.com",
    employeeCode: null,
    roleName: "Employee"
  }
] as EmployeeRecord[];

describe("employee directory filters", () => {
  it("searches names, email addresses, and employee codes case-insensitively", () => {
    expect(filterEmployees(employees, "AYESHA", "all")).toEqual([employees[0]]);
    expect(filterEmployees(employees, "bilal@", "all")).toEqual([employees[1]]);
    expect(filterEmployees(employees, "emp-1", "all")).toEqual([employees[0]]);
  });

  it("filters and counts employees by normalized role", () => {
    expect(filterEmployees(employees, "", "hr")).toEqual([employees[0]]);
    expect(countEmployeesByRole(employees)).toEqual({ hr: 1, employee: 1 });
  });
});
