import type { ManualAttendanceRequestStatus, ManualAttendanceRequestType } from "@attendance/db";

export type EmployeeAttendanceCorrectionRequest = {
  id: string;
  employeeId: string;
  type: ManualAttendanceRequestType;
  requestedTimestamp: Date | null;
  reason: string;
  status: ManualAttendanceRequestStatus;
  employee: {
    fullName: string;
    email: string;
    role: { name: string };
  };
};

export type AttendanceDecisionFeedback = {
  error?: string;
  success?: string;
};
