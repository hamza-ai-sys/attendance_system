import { describe, expect, it } from "vitest";
import { calculateAttendanceMetrics, getRoleBreakdown } from "./metrics";
import type { CompanyAttendanceScan, CompanyEmployee } from "../types";

function employee(id: string, roleName: string): CompanyEmployee {
  return { id, role: { name: roleName } } as CompanyEmployee;
}

function scan(id: string, employeeId: string, time: string): CompanyAttendanceScan {
  return { id, employeeId, serverReceivedAt: new Date(time) } as CompanyAttendanceScan;
}

describe("company attendance metrics", () => {
  const employees = [employee("employee-1", "employee"), employee("employee-2", "manager")];
  const scans = [
    scan("scan-1", "employee-1", "2026-08-10T09:10:00"),
    scan("scan-2", "employee-1", "2026-08-10T17:00:00"),
    scan("scan-3", "employee-2", "2026-08-10T09:20:00")
  ];

  it("calculates organization attendance from unique employees and first punches", () => {
    expect(calculateAttendanceMetrics(employees, scans)).toEqual({
      attendanceRatePercentage: 100,
      onTimeCount: 1,
      presentCount: 2,
      punctualityRatePercentage: 50,
      targetEmployeeCount: 2
    });
  });

  it("calculates a selected employee's attendance", () => {
    const metrics = calculateAttendanceMetrics(employees, scans.slice(0, 2), employees[0]);

    expect(metrics.attendanceRatePercentage).toBe(100);
    expect(metrics.presentCount).toBe(1);
    expect(metrics.targetEmployeeCount).toBe(1);
  });

  it("groups employees by role", () => {
    expect(getRoleBreakdown(employees)).toEqual({ employee: 1, manager: 1 });
    expect(getRoleBreakdown([])).toEqual({});
  });
});
