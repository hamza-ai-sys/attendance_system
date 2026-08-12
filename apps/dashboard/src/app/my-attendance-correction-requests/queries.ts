import { createPrismaClient } from "@attendance/db";
import { employmentAccessInclude, getEmploymentRoleKey } from "../../lib/employment";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export async function getManualRequests(employeeId: string, userAccountId?: string) {
  const requests = await db.manualAttendanceRequest.findMany({
    where: { OR: [{ employeeId }, ...(userAccountId ? [{ createdByUserAccountId: userAccountId }] : [])] },
    include: { employee: { include: employmentAccessInclude() } },
    orderBy: { createdAt: "desc" }
  });
  return requests.map((request) => ({
    ...request,
    employee: { role: { name: getEmploymentRoleKey(request.employee) } }
  }));
}
