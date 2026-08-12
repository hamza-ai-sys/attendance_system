export type CompanyAttendanceRange = "today" | "last_week" | "last_month" | "all_time";

export type SimpleEmployee = {
  id: string;
  fullName: string;
  roleName: string;
};

export type CompanyEmployee = {
  id: string;
  fullName?: string;
  roleName?: string;
  role?: { name: string } | null;
};

export type CompanyAttendanceScan = {
  id: string;
  employeeId: string | null;
  scannerTemplateId: number;
  serverReceivedAt: Date;
  employee: { fullName: string } | null;
  device: { name: string; location: string | null };
};

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
