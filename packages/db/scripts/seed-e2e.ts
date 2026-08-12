import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { seedAccessFoundation, upsertSeedEmployment } from "./seed-access.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to seed the E2E database.");

const parsedDatabaseUrl = new URL(databaseUrl);
const isLocalDatabase = ["127.0.0.1", "localhost"].includes(parsedDatabaseUrl.hostname);
if (
  process.env.NODE_ENV !== "test" ||
  !isLocalDatabase ||
  parsedDatabaseUrl.pathname !== "/attendance_e2e"
) {
  throw new Error("The E2E seed may only run against the attendance_e2e database in test mode.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

async function main() {
  const passwordHash = hashSync("password123", 10);

  await prisma.$transaction(async (tx) => {
    const access = await seedAccessFoundation(tx, {
      name: "E2E Organization",
      slug: "e2e"
    });
    const createEmployment = (input: {
      legalName: string;
      loginEmail: string;
      employeeCode: string;
      unitCode: string;
      positionCode: string;
    }) =>
      upsertSeedEmployment(tx, {
        ...input,
        organizationId: access.organization.id,
        passwordHash,
        unitId: access.units.get(input.unitCode)!.id,
        positionId: access.positions.get(input.positionCode)!.id
      });

    const owner = await createEmployment({
      legalName: "E2E Owner",
      loginEmail: "owner@e2e.test",
      employeeCode: "OWNER-001",
      unitCode: "EXEC",
      positionCode: "OWNER"
    });
    const manager = await createEmployment({
      legalName: "E2E Manager",
      loginEmail: "manager@e2e.test",
      employeeCode: "MGR-001",
      unitCode: "ENG",
      positionCode: "MANAGER"
    });
    const hr = await createEmployment({
      legalName: "E2E HR",
      loginEmail: "hr@e2e.test",
      employeeCode: "HR-001",
      unitCode: "HR",
      positionCode: "HR_OFFICER"
    });
    const employee = await createEmployment({
      legalName: "E2E Employee",
      loginEmail: "employee@e2e.test",
      employeeCode: "EMP-001",
      unitCode: "ENG",
      positionCode: "EMPLOYEE"
    });

    await tx.reportingLine.createMany({
      data: [
        {
          subordinateEmploymentId: manager.employment.id,
          supervisorEmploymentId: owner.employment.id,
          validFrom: new Date()
        },
        {
          subordinateEmploymentId: hr.employment.id,
          supervisorEmploymentId: owner.employment.id,
          validFrom: new Date()
        },
        {
          subordinateEmploymentId: employee.employment.id,
          supervisorEmploymentId: manager.employment.id,
          validFrom: new Date()
        }
      ]
    });

    const annualLeave = await tx.leaveTypeConfig.create({
      data: { code: "E2E_ANNUAL", name: "E2E Annual Leave", defaultAllocation: 10 }
    });

    await tx.manualAttendanceRequest.createMany({
      data: [
        {
          employeeId: employee.employment.id,
          createdByUserAccountId: employee.account.id,
          type: "ADD_SCAN",
          reason: "Manager-visible E2E request",
          requestedTimestamp: new Date("2026-01-12T09:00:00.000Z"),
          status: "PENDING_MANAGER"
        },
        {
          employeeId: hr.employment.id,
          createdByUserAccountId: hr.account.id,
          type: "ADD_SCAN",
          reason: "Organization-visible E2E request",
          requestedTimestamp: new Date("2026-01-13T09:00:00.000Z"),
          status: "PENDING_HR"
        }
      ]
    });

    await tx.leaveRequest.createMany({
      data: [
        {
          employeeId: employee.employment.id,
          leaveTypeId: annualLeave.id,
          startDate: new Date("2026-02-02T00:00:00.000Z"),
          endDate: new Date("2026-02-02T00:00:00.000Z"),
          totalDays: 1,
          reason: "Manager-visible E2E leave",
          status: "PENDING_MANAGER"
        },
        {
          employeeId: manager.employment.id,
          leaveTypeId: annualLeave.id,
          startDate: new Date("2026-02-03T00:00:00.000Z"),
          endDate: new Date("2026-02-03T00:00:00.000Z"),
          totalDays: 1,
          reason: "Organization-visible E2E leave",
          status: "PENDING_HR"
        }
      ]
    });
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
