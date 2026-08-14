import { describe, expect, it } from "vitest";
import { resolveCompanyAttendanceFilter } from "./filters";

const now = new Date(2026, 7, 10, 14, 30);

describe("resolveCompanyAttendanceFilter", () => {
  it("defaults invalid input to today's company view", () => {
    const filter = resolveCompanyAttendanceFilter({ range: "invalid" }, now);

    expect(filter).toEqual({
      range: "today",
      rangeTitle: "Today / Last Day",
      selectedEmployeeId: "all",
      startRange: new Date(2026, 7, 10)
    });
  });

  it("resolves an all-time employee filter", () => {
    const filter = resolveCompanyAttendanceFilter(
      { range: "all_time", employeeId: "employee-7" },
      now
    );

    expect(filter.startRange).toBeNull();
    expect(filter.selectedEmployeeId).toBe("employee-7");
    expect(filter.rangeTitle).toBe("All Time History");
  });
});
