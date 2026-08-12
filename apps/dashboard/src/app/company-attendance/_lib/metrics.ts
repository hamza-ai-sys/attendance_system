import type { CompanyAttendanceMetrics, CompanyAttendanceScan, CompanyEmployee } from "../types";

export function calculateAttendanceMetrics(
  employees: CompanyEmployee[],
  scans: CompanyAttendanceScan[],
  selectedEmployee?: CompanyEmployee
): CompanyAttendanceMetrics {
  const presentEmployeeIds = new Set(scans.map(({ employeeId }) => employeeId).filter(Boolean));
  const targetEmployeeCount = selectedEmployee ? 1 : employees.length;
  const presentCount = selectedEmployee
    ? Number(presentEmployeeIds.has(selectedEmployee.id))
    : presentEmployeeIds.size;
  const firstPunches = getFirstPunches(scans);
  const onTimeCount = [...firstPunches.values()].filter(isOnTime).length;

  return {
    attendanceRatePercentage:
      targetEmployeeCount > 0 ? Math.round((presentCount / targetEmployeeCount) * 100) : 0,
    onTimeCount,
    presentCount,
    punctualityRatePercentage:
      presentCount > 0 ? Math.round((onTimeCount / presentCount) * 100) : 100,
    targetEmployeeCount
  };
}

export function getRoleBreakdown(employees: CompanyEmployee[]): Record<string, number> {
  return employees.reduce<Record<string, number>>((breakdown, employee) => {
    const roleName = employee.role?.name || "employee";
    breakdown[roleName] = (breakdown[roleName] || 0) + 1;
    return breakdown;
  }, {});
}

function getFirstPunches(scans: CompanyAttendanceScan[]): Map<string, Date> {
  const firstPunches = new Map<string, Date>();
  for (const scan of scans) {
    if (!scan.employeeId) continue;
    const current = firstPunches.get(scan.employeeId);
    if (!current || scan.serverReceivedAt < current) {
      firstPunches.set(scan.employeeId, scan.serverReceivedAt);
    }
  }
  return firstPunches;
}

function isOnTime(date: Date): boolean {
  return date.getHours() < 9 || (date.getHours() === 9 && date.getMinutes() <= 15);
}
