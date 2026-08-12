import { createPrismaClient } from "@attendance/db";
import type { EmployeeManagerOption, EmployeeRecord, EmployeeRoleOption } from "./types";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export async function getEmployeeRecords(): Promise<EmployeeRecord[]> {
  const employees = await db.employee.findMany({
    include: { role: true, supervisor: true },
    orderBy: { fullName: "asc" }
  });

  return employees.map((employee) => ({
    id: employee.id,
    fullName: employee.fullName,
    email: employee.email,
    employeeCode: employee.employeeCode,
    roleName: employee.role?.name || "employee",
    managerName: employee.supervisor?.fullName || "None",
    timezone: employee.timezone,
    status: employee.status
  }));
}

export async function getEmployeeFormOptions(): Promise<{
  managers: EmployeeManagerOption[];
  roles: EmployeeRoleOption[];
}> {
  const [roles, managers] = await Promise.all([
    db.role.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.employee.findMany({
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" }
    })
  ]);

  return { roles, managers };
}
