export interface AttendanceRange {
  startDate: Date;
  endDate: Date;
  bannerTitle: string;
}

function dayBounds(date: Date): { startDate: Date; endDate: Date } {
  return {
    startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  };
}

export function getLastWeekRange(referenceDate = new Date()): AttendanceRange {
  const distanceToMonday = referenceDate.getDay() === 0 ? 6 : referenceDate.getDay() - 1;
  const startDate = new Date(referenceDate);
  startDate.setDate(referenceDate.getDate() - distanceToMonday - 7);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate, bannerTitle: "Last Week's Attendance Summary" };
}

export function getFixedAttendanceRange(range: string, now = new Date()): AttendanceRange | null {
  const today = dayBounds(now);
  if (range === "today") return { ...today, bannerTitle: "Today / Last Day's Attendance Summary" };
  if (range !== "last_month") return range === "last_week" ? getLastWeekRange(now) : null;
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);
  return {
    startDate,
    endDate: today.endDate,
    bannerTitle: "Last Month's Attendance Summary (30 Days)"
  };
}

export function formatDateRange(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const startText = formatter.format(start);
  const endText = formatter.format(end);
  return startText === endText ? startText : `${startText} – ${endText}`;
}
