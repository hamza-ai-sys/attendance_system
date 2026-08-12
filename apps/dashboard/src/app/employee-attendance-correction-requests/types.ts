import type { Prisma } from "@attendance/db";

export type EmployeeAttendanceCorrectionRequest = Prisma.ManualAttendanceRequestGetPayload<{
  include: {
    employee: { include: { role: true } };
    createdBy: { include: { role: true } };
  };
}>;

export type AttendanceDecisionFeedback = {
  error?: string;
  success?: string;
};
