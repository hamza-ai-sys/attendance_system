import { createPrismaClient } from "@attendance/db";
import type { Prisma } from "@attendance/db";
import type { CompanyAttendanceFilter } from "./types";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export async function getCompanyAttendanceData(filter: CompanyAttendanceFilter) {
  const scanWhere: Prisma.ScanEventWhereInput = {};

  if (filter.startRange) {
    scanWhere.serverReceivedAt = { gte: filter.startRange };
  }
  if (filter.selectedEmployeeId !== "all") {
    scanWhere.employeeId = filter.selectedEmployeeId;
  }

  const [activeEmployees, activeDevicesCount, periodScans] = await Promise.all([
    db.employee.findMany({
      where: { status: "ACTIVE" },
      include: { role: true },
      orderBy: { fullName: "asc" }
    }),
    db.device.count({ where: { status: "ACTIVE" } }),
    db.scanEvent.findMany({
      where: scanWhere,
      include: { employee: true, device: true },
      orderBy: { serverReceivedAt: "desc" }
    })
  ]);

  return { activeEmployees, activeDevicesCount, periodScans };
}
