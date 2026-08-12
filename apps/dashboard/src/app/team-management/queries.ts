import { createPrismaClient } from "@attendance/db";
import type {
  ActivePerformanceTemplate,
  PerformanceTemplateField,
  TeamMemberSummary
} from "./types";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export async function getTeamManagementData(
  employeeId: string,
  companyWide: boolean
): Promise<{ members: TeamMemberSummary[]; activeTemplate: ActivePerformanceTemplate | null }> {
  let employees = await db.employee.findMany({
    where: companyWide ? {} : { supervisorId: employeeId },
    include: { role: true },
    orderBy: { fullName: "asc" }
  });
  if (!employees.length && !companyWide)
    employees = await db.employee.findMany({
      include: { role: true },
      orderBy: { fullName: "asc" }
    });
  const now = new Date();
  const template = await db.performanceTemplate.findFirst({
    where: { startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { createdAt: "desc" }
  });
  const members = employees.map((employee) => ({
    id: employee.id,
    fullName: employee.fullName,
    email: employee.email,
    employeeCode: employee.employeeCode,
    roleName: employee.role?.name ?? "Employee"
  }));
  const activeTemplate = template
    ? {
        id: template.id,
        title: template.title,
        description: template.description,
        fields: template.fields as unknown as PerformanceTemplateField[],
        startDate: template.startDate.toISOString(),
        endDate: template.endDate.toISOString()
      }
    : null;
  return { members, activeTemplate };
}
