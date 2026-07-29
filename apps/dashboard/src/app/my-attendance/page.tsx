import { getCurrentUser } from "../../lib/session";
import { hasPermission } from "../../lib/rbac";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { createPrismaClient } from "@attendance/db";
import { classifyDailyScans, evaluateShiftAttendance } from "@attendance/attendance-core";
import { logout } from "../login/actions";
import { ManualRequestsContainer } from "../manual-requests/manual-requests-container";
import { WeeklyAttendanceView, type WeekdayData } from "./weekly-attendance-view";
import { MyAttendanceRangeFilter } from "./range-filter";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

function getLastWeekRange(referenceDate = new Date()) {
  const date = new Date(referenceDate);
  const currentDayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const distanceToCurrentMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  const lastWeekMonday = new Date(date);
  lastWeekMonday.setDate(date.getDate() - distanceToCurrentMonday - 7);
  lastWeekMonday.setHours(0, 0, 0, 0);

  const lastWeekSunday = new Date(lastWeekMonday);
  lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);
  lastWeekSunday.setHours(23, 59, 59, 999);

  return { lastWeekMonday, lastWeekSunday };
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function formatDateHeader(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatDateRangeStr(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const startStr = new Intl.DateTimeFormat("en-US", options).format(start);
  const endStr = new Intl.DateTimeFormat("en-US", options).format(end);
  return startStr === endStr ? startStr : `${startStr} – ${endStr}`;
}

type PageProps = {
  searchParams: Promise<{ range?: string }>;
};

export default async function MyAttendancePage(props: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.roleName === "owner" || !hasPermission(user, "my_attendance")) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <Link href="/" className="back-link">← Back to Dashboard</Link>
            <h1 style={{ color: "#ef4444", background: "none" }}>Access Restricted</h1>
          </div>
          <form action={logout}>
            <button type="submit" className="logout-btn">Sign Out</button>
          </form>
        </header>
        <div className="panel" style={{ cursor: "default", borderLeft: "4px solid #ef4444", padding: "24px" }}>
          <h2>Owner Notice</h2>
          <p className="muted" style={{ marginTop: "8px" }}>
            Company Owners do not track personal attendance logs. Use <Link href="/company-attendance" style={{ color: "#60a5fa" }}>Company Attendance</Link> to view organization metrics.
          </p>
        </div>
      </main>
    );
  }

  const searchParams = await props.searchParams;
  const range = searchParams.range || "last_week";

  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let bannerTitle = "Last Week's Attendance Summary";

  if (range === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    bannerTitle = "Today / Last Day's Attendance Summary";
  } else if (range === "last_month") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    bannerTitle = "Last Month's Attendance Summary (30 Days)";
  } else if (range === "all_time") {
    const earliestScan = await db.scanEvent.findFirst({
      where: { employeeId: user.employeeId },
      orderBy: { serverReceivedAt: "asc" },
      select: { serverReceivedAt: true }
    });

    if (earliestScan) {
      startDate = new Date(earliestScan.serverReceivedAt);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    bannerTitle = "All Time Attendance History";
  } else {
    // Default: "last_week"
    const { lastWeekMonday, lastWeekSunday } = getLastWeekRange();
    startDate = lastWeekMonday;
    endDate = lastWeekSunday;
    bannerTitle = "Last Week's Attendance Summary";
  }

  // Fetch employee shift configuration
  const employee = await db.employee.findUnique({
    where: { id: user.employeeId },
    select: { shiftInTime: true, shiftOutTime: true }
  });
  const shiftInTime = employee?.shiftInTime || "09:00";
  const shiftOutTime = employee?.shiftOutTime || "17:00";

  // 1. Fetch weekly off-days setting
  const offDaysSetting = await db.companySetting.findUnique({
    where: { key: "weekly_off_days" }
  });
  const offDaysArray: number[] = Array.isArray(offDaysSetting?.value) ? (offDaysSetting.value as number[]) : [0];

  // 2. Fetch holidays during the selected period
  const holidays = await db.holiday.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // 3. Fetch leave requests overlapping the period
  const leaveRequests = await db.leaveRequest.findMany({
    where: {
      employeeId: user.employeeId,
      status: { in: ["APPROVED", "PENDING_MANAGER", "PENDING_HR"] },
      startDate: { lte: endDate },
      endDate: { gte: startDate }
    },
    include: { leaveType: true }
  });

  // 4. Fetch scans for the authenticated employee during period
  const scanEvents = await db.scanEvent.findMany({
    where: {
      employeeId: user.employeeId,
      serverReceivedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      serverReceivedAt: "asc"
    }
  });

  // Construct dates for each day in range
  const dayDates: Date[] = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    dayDates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const weekdays: WeekdayData[] = dayDates.map((d) => ({
    dayName: dayNames[d.getDay()]!,
    dateStr: formatDateHeader(d),
    fullDate: d,
    scans: []
  }));

  for (let i = 0; i < weekdays.length; i++) {
    const dayDate = weekdays[i]!.fullDate;

    // Filter scans matching this day
    const rawDayScans = scanEvents.filter((scan) => {
      const scanDate = new Date(scan.serverReceivedAt);
      return (
        scanDate.getFullYear() === dayDate.getFullYear() &&
        scanDate.getMonth() === dayDate.getMonth() &&
        scanDate.getDate() === dayDate.getDate()
      );
    });

    const formattedScans = rawDayScans.map((scan) => ({
      id: scan.id,
      timeStr: formatTime(new Date(scan.serverReceivedAt)),
      occurredAt: scan.serverReceivedAt
    }));

    weekdays[i]!.scans = classifyDailyScans(formattedScans, weekdays[i]!.dayName);

    // Determine shift attendance status & value
    if (weekdays[i]!.scans.length > 0) {
      const firstScan = rawDayScans[0] ? new Date(rawDayScans[0].serverReceivedAt) : null;
      const lastScan = rawDayScans.length > 0
        ? new Date(rawDayScans[rawDayScans.length - 1]!.serverReceivedAt)
        : firstScan;

      const evalResult = evaluateShiftAttendance({
        firstScanTime: firstScan,
        lastScanTime: lastScan,
        shiftInTime,
        shiftOutTime,
        graceMinutes: 20,
        halfDayThresholdHours: 3
      });

      weekdays[i]!.status = evalResult.status;
      weekdays[i]!.attendanceValue = evalResult.value;
      weekdays[i]!.evaluationReason = evalResult.reason;
    } else {
      weekdays[i]!.attendanceValue = 0;
      // Check Leave Request exemption
      const matchingLeave = leaveRequests.find((lr) => {
        const s = new Date(lr.startDate);
        s.setHours(0, 0, 0, 0);
        const e = new Date(lr.endDate);
        e.setHours(23, 59, 59, 999);
        return dayDate >= s && dayDate <= e;
      });

      if (matchingLeave) {
        weekdays[i]!.status = matchingLeave.status === "APPROVED" ? "APPROVED_LEAVE" : "PENDING_LEAVE";
        weekdays[i]!.leaveTypeName = matchingLeave.leaveType.name;
      } else {
        // Check Holiday exemption
        const foundHoliday = holidays.find((h) => {
          const hDate = new Date(h.date);
          return (
            hDate.getFullYear() === dayDate.getFullYear() &&
            hDate.getMonth() === dayDate.getMonth() &&
            hDate.getDate() === dayDate.getDate()
          );
        });

        if (foundHoliday) {
          weekdays[i]!.status = "HOLIDAY";
          weekdays[i]!.holidayName = foundHoliday.name;
        } else if (offDaysArray.includes(dayDate.getDay())) {
          weekdays[i]!.status = "WEEKEND";
        } else {
          weekdays[i]!.status = "ABSENT";
        }
      }
    }
  }

  const totalScans = scanEvents.length;
  const daysPresent = weekdays.reduce((sum, w) => sum + (w.attendanceValue ?? 0), 0);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>My Attendance</h1>
          <p className="muted">
            Viewing attendance for <strong>{user.fullName}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <MyAttendanceRangeFilter currentRange={range} />
          <Link href={"/leave-requests" as Route} className="back-link" style={{ textDecoration: "none" }}>
            🌴 Leave Portal
          </Link>
          <Link href="/" className="back-link">
            ← Dashboard
          </Link>
          <form action={logout}>
            <button type="submit" className="logout-btn">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Manual Request Pop-up Trigger */}
      <section>
        <ManualRequestsContainer />
      </section>

      {/* Date Banner */}
      <section className="banner">
        <div className="banner-info">
          <span className="banner-title">{bannerTitle}</span>
          <span className="banner-dates">
            {formatDateRangeStr(startDate, endDate)}
          </span>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Scans</span>
          <span className="stat-value">{totalScans}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Days Present</span>
          <span className="stat-value">{daysPresent} / {weekdays.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Scans / Active Day</span>
          <span className="stat-value">
            {daysPresent > 0 ? (totalScans / daysPresent).toFixed(1) : "0"}
          </span>
        </div>
      </section>

      {/* Weekly Grid Table */}
      <WeeklyAttendanceView weekdays={weekdays} />
    </main>
  );
}
