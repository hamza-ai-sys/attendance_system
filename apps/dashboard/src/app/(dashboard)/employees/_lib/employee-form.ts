import type { CreateEmployeeInput } from "../types";

export function parseCreateEmployeeForm(formData: FormData): CreateEmployeeInput {
  const value = (name: string) => String(formData.get(name) || "").trim();

  return {
    fullName: value("fullName"),
    email: value("email").toLowerCase(),
    employeeCode: value("employeeCode"),
    password: value("password"),
    grantDashboardAccess: formData.get("grantDashboardAccess") === "on",
    organizationUnitId: value("organizationUnitId"),
    positionId: value("positionId"),
    supervisorId: value("supervisorId") || value("managerId"),
    shiftInTime: value("shiftInTime") || "09:00",
    shiftOutTime: value("shiftOutTime") || "17:00",
    timezone: value("timezone") || "Asia/Karachi"
  };
}

export function validateCreateEmployeeInput(input: CreateEmployeeInput): string | null {
  if (!input.fullName) return "Full Name is required.";
  if (input.grantDashboardAccess && (!input.email || !input.email.includes("@"))) {
    return "A valid login email is required when dashboard access is enabled.";
  }
  if (input.grantDashboardAccess && input.password.length < 6) {
    return "Password must be at least 6 characters long when dashboard access is enabled.";
  }
  if (!input.organizationUnitId) return "Organization unit selection is required.";
  if (!input.positionId) return "Position selection is required.";
  return null;
}
