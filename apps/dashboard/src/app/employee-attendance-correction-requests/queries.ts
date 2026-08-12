import { createPrismaClient } from "@attendance/db";
import type { SessionUser } from "../../lib/session";
import type { EmployeeAttendanceCorrectionRequest } from "./types";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export function getEmployeeAttendanceCorrectionRequests(
  user: SessionUser
): Promise<EmployeeAttendanceCorrectionRequest[]> {
  const where =
    user.roleName === "manager"
      ? {
          employee: { supervisorId: user.employeeId },
          employeeId: { not: user.employeeId }
        }
      : {};

  return db.manualAttendanceRequest.findMany({
    where,
    include: {
      employee: { include: { role: true } },
      createdBy: { include: { role: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}
