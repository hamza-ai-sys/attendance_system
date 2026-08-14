import type { CompanyAttendanceFilter, CompanyAttendanceRange } from "../types";

const rangeTitles: Record<CompanyAttendanceRange, string> = {
  today: "Today / Last Day",
  last_week: "Last Week (7 Days)",
  last_month: "Last Month (30 Days)",
  all_time: "All Time History"
};

function normalizeRange(range?: string): CompanyAttendanceRange {
  if (range === "last_week" || range === "last_month" || range === "all_time") return range;
  return "today";
}

export function resolveCompanyAttendanceFilter(
  params: { range?: string; employeeId?: string },
  now = new Date()
): CompanyAttendanceFilter {
  const range = normalizeRange(params.range);
  let startRange: Date | null = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (range === "last_week") startRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "last_month") startRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (range === "all_time") startRange = null;

  return {
    range,
    rangeTitle: rangeTitles[range],
    selectedEmployeeId: params.employeeId || "all",
    startRange
  };
}
