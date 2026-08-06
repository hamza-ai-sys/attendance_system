import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { createPrismaClient } from "./index.js";
import { hashSync } from "bcryptjs";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(currentDir, "../../../.env");

if (existsSync(rootEnvPath)) {
  loadEnvFile(rootEnvPath);
}

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/attendance";
const db = createPrismaClient(dbUrl);

async function main() {
  console.log("Seeding dummy scan events for Shaheer...");

  // 1. Find or create Shaheer employee
  let shaheer = await db.employee.findFirst({
    where: {
      OR: [
        { email: { contains: "shaheer", mode: "insensitive" } },
        { fullName: { contains: "Shaheer", mode: "insensitive" } }
      ]
    }
  });

  if (!shaheer) {
    const role = await db.role.findFirst({ where: { name: "employee" } });
    shaheer = await db.employee.create({
      data: {
        fullName: "Shaheer",
        email: "shaheer@test.com",
        employeeCode: "EMP-07",
        passwordHash: hashSync("password123", 10),
        roleId: role?.id || null,
        shiftInTime: "09:00",
        shiftOutTime: "18:00",
        timezone: "Asia/Karachi",
        status: "ACTIVE"
      }
    });
    console.log("Created employee Shaheer:", shaheer.id);
  } else {
    console.log("Found existing employee Shaheer:", shaheer.id);
  }

  // 2. Find or create device
  let device = await db.device.findFirst();
  if (!device) {
    device = await db.device.create({
      data: {
        id: "esp32-dev-001",
        name: "Main Entrance Scanner",
        status: "ACTIVE",
        apiKeyHash: "dummy"
      }
    });
  }

  // 3. Clear ALL previous scan events for Shaheer to prevent duplicates
  await db.scanEvent.deleteMany({
    where: { employeeId: shaheer.id }
  });
  console.log("Cleared existing scans for Shaheer.");

  // 4. Calculate last week's Monday date
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const distanceToCurrentMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const lastWeekMonday = new Date(now);
  lastWeekMonday.setDate(now.getDate() - distanceToCurrentMonday - 7);
  lastWeekMonday.setHours(0, 0, 0, 0);

  let scanSeq = Date.now() % 100000;

  // Weekday schedules for Last Week (Mon-Fri)
  const schedules = [
    { dayOffset: 0, inHour: 8, inMin: 55, outHour: 18, outMin: 10 }, // Mon: Full Present (1.0)
    { dayOffset: 1, inHour: 9, inMin: 2, outHour: 17, outMin: 55 },  // Tue: Full Present (1.0)
    { dayOffset: 2, inHour: 8, inMin: 58, outHour: 18, outMin: 5 },   // Wed: Full Present (1.0)
    { dayOffset: 3, inHour: 8, inMin: 55, outHour: 18, outMin: 10 },  // Thu: Full Present (1.0)
    { dayOffset: 4, inHour: 9, inMin: 18, outHour: 14, outMin: 30 }   // Fri: Left 3+ hrs early (Half Leave 0.5)
  ];

  for (const item of schedules) {
    const scanDay = new Date(lastWeekMonday);
    scanDay.setDate(lastWeekMonday.getDate() + item.dayOffset);

    // Punch In (1st Scan of the day)
    const inDate = new Date(scanDay);
    inDate.setHours(item.inHour, item.inMin, 0, 0);

    scanSeq += 1;
    await db.scanEvent.create({
      data: {
        deviceId: device.id,
        employeeId: shaheer.id,
        scannerTemplateId: 107,
        deviceScanSequence: scanSeq,
        matchConfidence: 0.985,
        serverReceivedAt: inDate,
        createdAt: inDate
      }
    });

    // Punch Out (Last Scan of the day)
    const outDate = new Date(scanDay);
    outDate.setHours(item.outHour, item.outMin, 0, 0);

    scanSeq += 1;
    await db.scanEvent.create({
      data: {
        deviceId: device.id,
        employeeId: shaheer.id,
        scannerTemplateId: 107,
        deviceScanSequence: scanSeq,
        matchConfidence: 0.982,
        serverReceivedAt: outDate,
        createdAt: outDate
      }
    });
  }

  console.log(`Successfully seeded ${schedules.length * 2} clean scan events for Shaheer!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
