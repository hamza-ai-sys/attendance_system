import { createPrismaClient } from "@attendance/db";
import {
  currentAssignmentWhere,
  currentReportingLineWhere,
  employmentIdentityInclude,
  getEmploymentEmail,
  getEmploymentName
} from "../../lib/employment";
import type {
  EmployeeManagerOption,
  EmployeeRecord,
  OrganizationUnitOption,
  PositionOption
} from "./types";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export async function getEmployeeRecords(organizationId: string): Promise<EmployeeRecord[]> {
  const employees = await db.employment.findMany({
    where: { organizationId },
    include: {
      ...employmentIdentityInclude,
      organization: true,
      assignments: {
        where: currentAssignmentWhere(),
        orderBy: { validFrom: "desc" },
        take: 1,
        include: {
          organizationUnit: true,
          position: { include: { defaultRoleMappings: { include: { role: true } } } }
        }
      },
      subordinateLines: {
        where: currentReportingLineWhere(),
        take: 1,
        include: { supervisor: { include: employmentIdentityInclude } }
      },
      membership: {
        include: {
          person: { include: { userAccount: true } },
          roleAssignments: {
            where: { revokedAt: null },
            include: { role: true }
          }
        }
      }
    },
    orderBy: { employeeCode: "asc" }
  });

  return employees.map((employee) => {
    const assignment = employee.assignments[0];
    const explicitRole = employee.membership.roleAssignments[0]?.role;
    const positionRole = assignment?.position.defaultRoleMappings[0]?.role;

    return {
      id: employee.id,
      fullName: getEmploymentName(employee),
      email: getEmploymentEmail(employee),
      employeeCode: employee.employeeCode,
      roleName: explicitRole?.name ?? positionRole?.name ?? "Employee",
      departmentName: assignment?.organizationUnit.name ?? "Unassigned",
      positionTitle: assignment?.position.title ?? "Unassigned",
      managerName: employee.subordinateLines[0]?.supervisor
        ? getEmploymentName(employee.subordinateLines[0].supervisor)
        : "None",
      timezone: assignment?.timezone ?? employee.organization.timezone,
      status: employee.status
    };
  });
}

export async function getEmployeeFormOptions(organizationId: string): Promise<{
  managers: EmployeeManagerOption[];
  organizationUnits: OrganizationUnitOption[];
  positions: PositionOption[];
}> {
  const [organizationUnits, positions, managerRecords] = await Promise.all([
    db.organizationUnit.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    db.position.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" }
    }),
    db.employment.findMany({
      where: { organizationId, status: "ACTIVE" },
      include: employmentIdentityInclude,
      orderBy: { employeeCode: "asc" }
    })
  ]);

  const managers = managerRecords.map((employment) => ({
    id: employment.id,
    fullName: getEmploymentName(employment),
    email: getEmploymentEmail(employment)
  }));

  return { managers, organizationUnits, positions };
}
