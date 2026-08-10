import type { Prisma } from "@attendance/db";

export type EmployeeLeaveRequest = Prisma.LeaveRequestGetPayload<{
  include: {
    employee: { include: { role: true } };
    leaveType: true;
  };
}>;

export type LeaveDecisionFeedback = {
  error?: string;
  success?: boolean;
};
