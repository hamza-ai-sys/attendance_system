import { calculateAvailableBalance } from "@attendance/attendance-core";
import { createPrismaClient } from "@attendance/db";
import type { LeaveBalanceItem, LeaveRequestItem, LeaveTypeOption } from "./leave-requests-client";

const db = createPrismaClient(process.env.DATABASE_URL as string);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

async function getBalances(
  employeeId: string,
  year: number
): Promise<{ balances: LeaveBalanceItem[]; activeTypes: LeaveTypeOption[] }> {
  const leaveTypes = await db.leaveTypeConfig.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });
  const records = await db.leaveBalance.findMany({ where: { employeeId, year } });
  const balances = await Promise.all(
    leaveTypes.map(async (leaveType) => {
      const existing = records.find((record) => record.leaveTypeId === leaveType.id);
      const allocated = existing?.allocated ?? leaveType.defaultAllocation;
      const accrued = leaveType.defaultAllocation;
      const used = existing?.used ?? 0;
      const carriedOver = existing?.carriedOver ?? 0;
      const data = { allocated, accrued, used, carriedOver };
      if (!existing)
        await db.leaveBalance.create({
          data: { employeeId, year, leaveTypeId: leaveType.id, ...data }
        });
      else if (existing.accrued !== accrued)
        await db.leaveBalance.update({ where: { id: existing.id }, data: { accrued, allocated } });
      return {
        id: existing?.id ?? leaveType.id,
        leaveTypeId: leaveType.id,
        leaveTypeName: leaveType.name,
        leaveTypeCode: leaveType.code,
        isPaid: leaveType.isPaid,
        ...data,
        available: calculateAvailableBalance(accrued, carriedOver, used)
      };
    })
  );
  return {
    balances,
    activeTypes: leaveTypes.map(({ id, name, code, isPaid }) => ({ id, name, code, isPaid }))
  };
}

async function getRequests(employeeId: string): Promise<LeaveRequestItem[]> {
  const requests = await db.leaveRequest.findMany({
    where: { employeeId },
    include: { leaveType: true },
    orderBy: { createdAt: "desc" }
  });
  return requests.map((request) => ({
    id: request.id,
    leaveTypeName: request.leaveType.name,
    leaveTypeCode: request.leaveType.code,
    startDateStr: formatDate(request.startDate),
    endDateStr: formatDate(request.endDate),
    totalDays: request.totalDays,
    paidDays: request.paidDays,
    unpaidDays: request.unpaidDays,
    reason: request.reason,
    status: request.status,
    rejectionReason: request.rejectionReason,
    createdAtStr: formatDate(request.createdAt)
  }));
}

export async function getLeaveRequestsPageData(employeeId: string) {
  const [{ balances, activeTypes }, requests] = await Promise.all([
    getBalances(employeeId, new Date().getFullYear()),
    getRequests(employeeId)
  ]);
  return { balances, activeTypes, requests };
}
