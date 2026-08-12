import type { Prisma } from "@attendance/db";

export type CompanyAttendanceRange = "today" | "last_week" | "last_month" | "all_time";

export type SimpleEmployee = {
  id: string;
  fullName: string;
  roleName: string;
};

export type CompanyEmployee = Prisma.EmployeeGetPayload<{
  include: { role: true };
}>;

export type CompanyAttendanceScan = Prisma.ScanEventGetPayload<{
  include: { employee: true; device: true };
}>;

export type CompanyAttendanceMetrics = {
  attendanceRatePercentage: number;
  onTimeCount: number;
  presentCount: number;
  punctualityRatePercentage: number;
  targetEmployeeCount: number;
};

export type CompanyAttendanceFilter = {
  range: CompanyAttendanceRange;
  rangeTitle: string;
  selectedEmployeeId: string;
  startRange: Date | null;
};
