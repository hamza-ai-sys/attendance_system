import type { CreateEmployeeInput } from "../types";

export function parseCreateEmployeeForm(formData: FormData): CreateEmployeeInput {
  const value = (name: string) => String(formData.get(name) || "").trim();

  return {
    fullName: value("fullName"),
    email: value("email").toLowerCase(),
    employeeCode: value("employeeCode"),
    password: value("password"),
    roleId: value("roleId"),
    supervisorId: value("supervisorId") || value("managerId"),
    shiftInTime: value("shiftInTime") || "09:00",
    shiftOutTime: value("shiftOutTime") || "17:00",
    timezone: value("timezone") || "Asia/Karachi"
  };
}

export function validateCreateEmployeeInput(input: CreateEmployeeInput): string | null {
  if (!input.fullName) return "Full Name is required.";
  if (!input.email || !input.email.includes("@")) return "A valid email address is required.";
  if (input.password.length < 6) return "Password must be at least 6 characters long.";
  if (!input.roleId) return "Role selection is required.";
  return null;
}
