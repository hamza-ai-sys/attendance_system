export type TeamAttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "HOLIDAY" | "WEEKEND";

export interface TeamAttendanceRow {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
  scanCount: number;
  firstIn: string;
  lastOut: string;
  status: TeamAttendanceStatus;
}

export interface TeamAttendanceData {
  rows: TeamAttendanceRow[];
  dateText: string;
  dayNote?: string;
  metrics: { total: number; present: number; late: number; absent: number; exempt: number };
}
