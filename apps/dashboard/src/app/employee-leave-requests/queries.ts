import { createPrismaClient } from "@attendance/db";
import type { SessionUser } from "../../lib/session";
import type { EmployeeLeaveRequest } from "./types";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export function getEmployeeLeaveRequests(user: SessionUser): Promise<EmployeeLeaveRequest[]> {
  const where =
    user.roleName === "manager"
      ? {
          employee: { supervisorId: user.employeeId },
          employeeId: { not: user.employeeId }
        }
      : {};

  return db.leaveRequest.findMany({
    where,
    include: {
      employee: { include: { role: true } },
      leaveType: true
    },
    orderBy: { createdAt: "desc" }
  });
}
