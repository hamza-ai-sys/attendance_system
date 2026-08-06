import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const seedDir = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(seedDir, "../../../.env");

if (existsSync(rootEnvPath)) {
  loadEnvFile(rootEnvPath);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
  transactionOptions: { timeout: 30_000 }
});
const devDeviceId = "esp32-dev-001";
const devDeviceSecret = getRequiredEnv("DEV_DEVICE_SECRET");
const seededScanPayload = { source: "development-seed" } as const;

function hashDeviceSecret(secret: string) {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

function getRequiredEnv(name: "DATABASE_URL" | "DEV_DEVICE_SECRET") {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is required to seed the database. Create .env from .env.dev.example or set ${name}.`
    );
  }

  return value;
}

function getDatabaseUrl() {
  return getRequiredEnv("DATABASE_URL");
}

async function main() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("The development seed may only run when NODE_ENV=development.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Setup RBAC Roles and Permissions
    const rolesData = [
      { name: "employee", perms: ["my_attendance", "manual_reports"] },
      {
        name: "manager",
        perms: ["my_attendance", "manual_reports", "team_attendance", "approvals", "my_team"]
      },
      {
        name: "hr",
        perms: [
          "my_attendance",
          "manual_reports",
          "enrollment",
          "reports",
          "company_attendance",
          "approvals",
          "my_team",
          "jobs_manage",
          "announcements_manage"
        ]
      },
      {
        name: "owner",
        perms: [
          "my_attendance",
          "manual_reports",
          "enrollment",
          "reports",
          "company_attendance",
          "approvals",
          "my_team",
          "jobs_manage",
          "announcements_manage"
        ]
      }
    ];

    for (const p of [...new Set(rolesData.flatMap((r) => r.perms))]) {
      await tx.permission.upsert({ create: { name: p }, update: {}, where: { name: p } });
    }

    const roles: Record<string, { id: string }> = {};
    for (const r of rolesData) {
      roles[r.name] = await tx.role.upsert({
        create: { name: r.name },
        update: {},
        where: { name: r.name }
      });

      const permissions = await tx.permission.findMany({
        select: { id: true },
        where: { name: { in: r.perms } }
      });

      await tx.rolePermission.deleteMany({ where: { roleId: roles[r.name]!.id } });
      await tx.rolePermission.createMany({
        data: permissions.map((permission) => ({
          permissionId: permission.id,
          roleId: roles[r.name]!.id
        }))
      });
    }

    // 2. Setup Employees with generic password123
    const defaultPasswordHash = hashSync("password123", 10);

    const owner = await tx.employee.upsert({
      create: {
        email: "owner@test.com",
        fullName: "Company Owner",
        roleId: roles["owner"]!.id,
        passwordHash: defaultPasswordHash
      },
      update: {
        fullName: "Company Owner",
        passwordHash: defaultPasswordHash,
        roleId: roles["owner"]!.id,
        status: "ACTIVE"
      },
      where: { email: "owner@test.com" }
    });

    const hr = await tx.employee.upsert({
      create: {
        email: "hr@test.com",
        fullName: "HR Manager",
        roleId: roles["hr"]!.id,
        supervisorId: owner.id,
        passwordHash: defaultPasswordHash
      },
      update: {
        fullName: "HR Manager",
        passwordHash: defaultPasswordHash,
        roleId: roles["hr"]!.id,
        status: "ACTIVE",
        supervisorId: owner.id
      },
      where: { email: "hr@test.com" }
    });

    const manager = await tx.employee.upsert({
      create: {
        email: "manager@test.com",
        fullName: "Team Manager",
        roleId: roles["manager"]!.id,
        supervisorId: owner.id,
        passwordHash: defaultPasswordHash
      },
      update: {
        fullName: "Team Manager",
        passwordHash: defaultPasswordHash,
        roleId: roles["manager"]!.id,
        status: "ACTIVE",
        supervisorId: owner.id
      },
      where: { email: "manager@test.com" }
    });

    const employee = await tx.employee.upsert({
      create: {
        email: "employee@test.com",
        fullName: "Regular Employee",
        roleId: roles["employee"]!.id,
        supervisorId: manager.id,
        passwordHash: defaultPasswordHash
      },
      update: {
        fullName: "Regular Employee",
        passwordHash: defaultPasswordHash,
        roleId: roles["employee"]!.id,
        status: "ACTIVE",
        supervisorId: manager.id
      },
      where: { email: "employee@test.com" }
    });

    const shaheer = await tx.employee.upsert({
      create: {
        email: "shaheer@test.com",
        employeeCode: "EMP-07",
        fullName: "Shaheer",
        roleId: roles["employee"]!.id,
        supervisorId: manager.id,
        passwordHash: defaultPasswordHash,
        shiftInTime: "09:00",
        shiftOutTime: "18:00",
        timezone: "Asia/Karachi"
      },
      update: {
        employeeCode: "EMP-07",
        fullName: "Shaheer",
        passwordHash: defaultPasswordHash,
        roleId: roles["employee"]!.id,
        shiftInTime: "09:00",
        shiftOutTime: "18:00",
        status: "ACTIVE",
        supervisorId: manager.id,
        timezone: "Asia/Karachi"
      },
      where: { email: "shaheer@test.com" }
    });

    // 3. Setup Dev Device
    const device = await tx.device.upsert({
      create: {
        apiKeyHash: hashDeviceSecret(devDeviceSecret),
        id: devDeviceId,
        location: "Development bench",
        name: "Development ESP32"
      },
      update: {
        apiKeyHash: hashDeviceSecret(devDeviceSecret),
        status: "ACTIVE"
      },
      where: {
        id: devDeviceId
      }
    });

    // 4. Seed Last Week Sample Scans with unique schedules for each employee role
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const distanceToCurrentMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const lastWeekMonday = new Date(now);
    lastWeekMonday.setDate(now.getDate() - distanceToCurrentMonday - 7);
    lastWeekMonday.setHours(0, 0, 0, 0);

    const employeeSchedules = [
      {
        emp: shaheer,
        scannerTemplateId: 107,
        schedule: [
          { dayOffset: 0, times: ["08:55:00", "18:10:00"] },
          { dayOffset: 1, times: ["09:02:00", "17:55:00"] },
          { dayOffset: 2, times: ["08:58:00", "18:05:00"] },
          { dayOffset: 3, times: ["08:55:00", "18:10:00"] },
          { dayOffset: 4, times: ["09:18:00", "14:30:00"] }
        ]
      },
      {
        emp: employee,
        scannerTemplateId: 101,
        schedule: [
          { dayOffset: 0, times: ["08:58:00", "13:05:00", "17:32:00"] }, // Monday
          { dayOffset: 1, times: ["09:02:00", "17:15:00"] }, // Tuesday
          { dayOffset: 2, times: ["08:55:00", "13:00:00", "17:45:00"] }, // Wednesday
          { dayOffset: 3, times: ["09:10:00", "17:00:00"] }, // Thursday
          { dayOffset: 4, times: ["08:50:00", "16:45:00"] } // Friday
        ]
      },
      {
        emp: manager,
        scannerTemplateId: 102,
        schedule: [
          { dayOffset: 0, times: ["08:30:00", "13:15:00", "18:05:00"] }, // Monday
          { dayOffset: 1, times: ["08:42:00", "12:45:00", "18:12:00"] }, // Tuesday
          { dayOffset: 2, times: ["08:35:00", "17:55:00"] }, // Wednesday
          { dayOffset: 3, times: ["08:40:00", "13:10:00", "18:30:00"] }, // Thursday
          { dayOffset: 4, times: ["08:25:00", "17:30:00"] } // Friday
        ]
      },
      {
        emp: hr,
        scannerTemplateId: 103,
        schedule: [
          { dayOffset: 0, times: ["09:15:00", "17:45:00"] }, // Monday
          { dayOffset: 1, times: ["09:00:00", "13:30:00", "17:30:00"] }, // Tuesday
          { dayOffset: 2, times: ["09:10:00", "17:40:00"] }, // Wednesday
          { dayOffset: 3, times: ["08:55:00", "13:20:00", "17:50:00"] }, // Thursday
          { dayOffset: 4, times: ["09:05:00", "17:00:00"] } // Friday
        ]
      },
      {
        emp: owner,
        scannerTemplateId: 104,
        schedule: [
          { dayOffset: 0, times: ["08:15:00", "12:00:00", "14:30:00", "19:10:00"] }, // Monday (4 scans)
          { dayOffset: 1, times: ["08:20:00", "18:45:00"] }, // Tuesday
          { dayOffset: 2, times: ["08:10:00", "13:00:00", "19:30:00"] }, // Wednesday
          { dayOffset: 3, times: ["08:25:00", "18:50:00"] }, // Thursday
          { dayOffset: 4, times: ["08:05:00", "16:30:00"] } // Friday
        ]
      }
    ];

    for (const item of employeeSchedules) {
      await tx.fingerprintEnrollment.upsert({
        create: {
          deviceId: device.id,
          employeeId: item.emp.id,
          scannerTemplateId: item.scannerTemplateId
        },
        update: {
          revokedAt: null,
          scannerTemplateId: item.scannerTemplateId,
          status: "ACTIVE"
        },
        where: {
          employeeId_deviceId: {
            deviceId: device.id,
            employeeId: item.emp.id
          }
        }
      });
    }

    await tx.scanEvent.deleteMany({
      where: {
        deviceId: device.id,
        rawPayload: { equals: seededScanPayload }
      }
    });

    const seededScans = [];
    for (const item of employeeSchedules) {
      for (const dayEntry of item.schedule) {
        const scanDay = new Date(lastWeekMonday);
        scanDay.setDate(lastWeekMonday.getDate() + dayEntry.dayOffset);

        for (const timeStr of dayEntry.times) {
          const [hours, minutes, seconds] = timeStr.split(":").map(Number);
          const scanTimestamp = new Date(scanDay);
          scanTimestamp.setHours(hours!, minutes!, seconds!, 0);

          seededScans.push({
            createdAt: scanTimestamp,
            deviceId: device.id,
            employeeId: item.emp.id,
            rawPayload: seededScanPayload,
            scannerTemplateId: item.scannerTemplateId,
            serverReceivedAt: scanTimestamp
          });
        }
      }
    }

    await tx.scanEvent.createMany({ data: seededScans });

    // 5. Seed Default Company Settings & Sample Holiday
    await tx.companySetting.upsert({
      create: {
        key: "weekly_off_days",
        value: [0] // Sunday default off-day
      },
      update: {},
      where: { key: "weekly_off_days" }
    });

    const holidayDate = new Date();
    holidayDate.setDate(holidayDate.getDate() + 2); // 2 days from now
    holidayDate.setHours(0, 0, 0, 0);

    await tx.holiday.deleteMany({
      where: {
        description: "Company-wide annual off-day",
        name: "Official Company Holiday",
        NOT: { date: holidayDate }
      }
    });

    await tx.holiday.upsert({
      create: {
        name: "Official Company Holiday",
        date: holidayDate,
        description: "Company-wide annual off-day"
      },
      update: {
        description: "Company-wide annual off-day",
        name: "Official Company Holiday"
      },
      where: { date: holidayDate }
    });

    // 6. Seed Default HR Leave Types & Employee Balances
    const defaultLeaveTypes = [
      {
        code: "ANNUAL",
        name: "Annual Leave",
        description: "Paid annual vacation days",
        accrualFrequency: "MONTHLY" as const,
        defaultAllocation: 14,
        allowCarryForward: true,
        maxCarryForwardDays: 5,
        isPaid: true
      },
      {
        code: "SICK",
        name: "Sick Leave",
        description: "Paid medical & health leave",
        accrualFrequency: "MONTHLY" as const,
        defaultAllocation: 8,
        allowCarryForward: false,
        maxCarryForwardDays: 0,
        isPaid: true
      },
      {
        code: "CASUAL",
        name: "Casual Leave",
        description: "Short notice casual time off",
        accrualFrequency: "MONTHLY" as const,
        defaultAllocation: 10,
        allowCarryForward: false,
        maxCarryForwardDays: 0,
        isPaid: true
      },
      {
        code: "UNPAID",
        name: "Unpaid Leave",
        description: "Leave without pay (LOP)",
        accrualFrequency: "ANNUALLY" as const,
        defaultAllocation: 0,
        allowCarryForward: false,
        maxCarryForwardDays: 0,
        isPaid: false
      }
    ];

    const seededLeaveTypes: Record<string, { id: string }> = {};
    for (const lt of defaultLeaveTypes) {
      const created = await tx.leaveTypeConfig.upsert({
        create: lt,
        update: {
          accrualFrequency: lt.accrualFrequency,
          allowCarryForward: lt.allowCarryForward,
          defaultAllocation: lt.defaultAllocation,
          description: lt.description,
          isActive: true,
          isPaid: lt.isPaid,
          maxCarryForwardDays: lt.maxCarryForwardDays,
          name: lt.name
        },
        where: { code: lt.code }
      });
      seededLeaveTypes[lt.code] = created;
    }

    const currentYear = new Date().getFullYear();
    const allEmps = [owner, hr, manager, employee, shaheer];

    for (const emp of allEmps) {
      for (const lt of defaultLeaveTypes) {
        const typeConfig = seededLeaveTypes[lt.code]!;
        const accrued = lt.defaultAllocation;

        await tx.leaveBalance.upsert({
          create: {
            employeeId: emp.id,
            year: currentYear,
            leaveTypeId: typeConfig.id,
            allocated: lt.defaultAllocation,
            accrued,
            used: 0,
            carriedOver: 0
          },
          update: {
            accrued,
            allocated: lt.defaultAllocation
          },
          where: {
            employeeId_year_leaveTypeId: {
              employeeId: emp.id,
              year: currentYear,
              leaveTypeId: typeConfig.id
            }
          }
        });
      }
    }
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
