import { describe, expect, it } from "vitest";
import type { DashboardModule } from "./dashboard-modules";
import { getNavigationGroups, getPageTitle } from "./dashboard-navigation";

const modules: DashboardModule[] = [
  {
    description: "Personal attendance",
    href: "/my-attendance",
    name: "My Attendance",
    permission: "my_attendance"
  },
  {
    description: "Employee directory",
    href: "/employees",
    name: "Employees",
    permission: "enrollment"
  },
  {
    description: "Create an employee",
    href: "/employees/new",
    name: "Add Employee",
    permission: "enrollment"
  },
  {
    description: "Team attendance",
    href: "/team-attendance",
    name: "Team Attendance",
    permission: "team_attendance"
  }
];

describe("dashboard navigation", () => {
  it("groups permitted destinations and omits secondary creation routes", () => {
    expect(getNavigationGroups(modules)).toEqual([
      { label: "My Work", modules: [modules[0]] },
      { label: "Team", modules: [modules[3]] },
      { label: "Organization", modules: [modules[1]] }
    ]);
  });

  it("uses the parent module title for nested routes", () => {
    expect(getPageTitle("/employees/123", modules)).toBe("Employees");
    expect(getPageTitle("/employees/new", modules)).toBe("Add Employee");
  });
});
