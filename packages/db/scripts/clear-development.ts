import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(scriptDir, "../../../.env");

if (existsSync(rootEnvPath)) {
  loadEnvFile(rootEnvPath);
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required to clear the database. Create .env from .env.example or set DATABASE_URL."
    );
  }

  return databaseUrl;
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Database cleanup is disabled in production.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseUrl() })
  });

  try {
    const deletedRows = await prisma.$transaction(async (tx) => {
      const results: { count: number }[] = [];

      // Delete dependent records before the records they reference.
      results.push(await tx.approvalStep.deleteMany());
      results.push(await tx.leaveApprovalStep.deleteMany());
      results.push(await tx.notification.deleteMany());
      results.push(await tx.reportExport.deleteMany());
      results.push(await tx.fingerprintEnrollment.deleteMany());
      results.push(await tx.enrollmentSession.deleteMany());
      results.push(await tx.employeeShiftAssignment.deleteMany());
      results.push(await tx.manualAttendanceRequest.deleteMany());
      results.push(await tx.leaveRequest.deleteMany());
      results.push(await tx.leaveBalance.deleteMany());
      results.push(await tx.scanEvent.deleteMany());
      results.push(await tx.auditLog.deleteMany());
      results.push(await tx.jobRun.deleteMany());
      results.push(await tx.holiday.deleteMany());
      results.push(await tx.companySetting.deleteMany());
      results.push(await tx.employee.deleteMany());
      results.push(await tx.device.deleteMany());
      results.push(await tx.shift.deleteMany());
      results.push(await tx.leaveTypeConfig.deleteMany());
      results.push(await tx.rolePermission.deleteMany());
      results.push(await tx.role.deleteMany());
      results.push(await tx.permission.deleteMany());

      return results.reduce((total, result) => total + result.count, 0);
    });

    console.log(`Database cleared successfully. Deleted ${deletedRows} application records.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
