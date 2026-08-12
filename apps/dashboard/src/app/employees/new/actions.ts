"use server";

import { createPrismaClient } from "@attendance/db";
import { hashSync } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../../../lib/session";
import { parseCreateEmployeeForm, validateCreateEmployeeInput } from "../_lib/employee-form";
import { canCreateEmployees } from "../permissions";
import type { CreateEmployeeInput, CreateEmployeeState } from "../types";

const db = createPrismaClient(process.env.DATABASE_URL as string);

async function getEmployeeConflict(input: CreateEmployeeInput): Promise<string | null> {
  const existingEmail = await db.employee.findUnique({ where: { email: input.email } });
  if (existingEmail) return `An employee with the email "${input.email}" already exists.`;

  if (input.employeeCode) {
    const existingCode = await db.employee.findUnique({
      where: { employeeCode: input.employeeCode }
    });
    if (existingCode) return `Employee code "${input.employeeCode}" is already in use.`;
  }

  return null;
}

export async function createEmployee(
  _previousState: CreateEmployeeState,
  formData: FormData
): Promise<CreateEmployeeState> {
  const user = await getCurrentUser();
  if (!user || !canCreateEmployees(user)) {
    return { error: "Unauthorized: You do not have permission to enroll employees." };
  }

  const input = parseCreateEmployeeForm(formData);
  const validationError = validateCreateEmployeeInput(input);
  if (validationError) return { error: validationError };

  const conflict = await getEmployeeConflict(input);
  if (conflict) return { error: conflict };

  await db.employee.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      employeeCode: input.employeeCode || null,
      passwordHash: hashSync(input.password, 10),
      roleId: input.roleId,
      supervisorId: input.supervisorId || null,
      shiftInTime: input.shiftInTime,
      shiftOutTime: input.shiftOutTime,
      timezone: input.timezone,
      status: "ACTIVE"
    }
  });

  revalidatePath("/employees");
  return { success: `New employee "${input.fullName}" (${input.email}) enrolled successfully!` };
}
