import { createPrismaClient } from "@attendance/db";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export function getManualRequests(employeeId: string) {
  return db.manualAttendanceRequest.findMany({
    where: { OR: [{ employeeId }, { createdByEmployeeId: employeeId }] },
    include: { employee: { include: { role: true } }, createdBy: true },
    orderBy: { createdAt: "desc" }
  });
}
