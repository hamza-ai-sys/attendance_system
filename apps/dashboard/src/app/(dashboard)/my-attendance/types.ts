import type { TaggedScan } from "@attendance/attendance-core";

export type DisplayScan = TaggedScan<{ id: string; timeStr: string; occurredAt: Date }>;

export interface WeekdayData {
  dayName: string;
  dateStr: string;
  fullDate: Date;
  scans: DisplayScan[];
  status?:
    | "PRESENT"
    | "HALF_DAY"
    | "LATE"
    | "ABSENT"
    | "HOLIDAY"
    | "WEEKEND"
    | "APPROVED_LEAVE"
    | "PENDING_LEAVE";
  holidayName?: string;
  leaveTypeName?: string;
  attendanceValue?: number;
  evaluationReason?: string;
}

export interface AttendancePageData {
  range: string;
  bannerTitle: string;
  dateRange: string;
  weekdays: WeekdayData[];
  totalScans: number;
  daysPresent: number;
}
