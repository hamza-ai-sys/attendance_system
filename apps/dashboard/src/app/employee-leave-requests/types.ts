import type { LeaveRequestStatus } from "@attendance/db";

export type EmployeeLeaveRequest = {
  id: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  paidDays: number | null;
  unpaidDays: number | null;
  reason: string;
  status: LeaveRequestStatus;
  employee: {
    fullName: string;
    email: string;
    role: { name: string };
  };
  leaveType: { name: string; isPaid: boolean };
};

export type LeaveDecisionFeedback = {
  error?: string;
  success?: boolean;
};
