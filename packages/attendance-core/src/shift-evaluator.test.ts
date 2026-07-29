import { describe, it, expect } from "vitest";
import { evaluateShiftAttendance } from "./shift-evaluator";

describe("evaluateShiftAttendance", () => {
  it("returns ABSENT when no first scan exists", () => {
    const res = evaluateShiftAttendance({
      firstScanTime: null,
      lastScanTime: null
    });
    expect(res.status).toBe("ABSENT");
    expect(res.value).toBe(0);
  });

  it("returns PRESENT (1.0) when scans are within 20 min grace window (09:15 and 16:50)", () => {
    const res = evaluateShiftAttendance({
      firstScanTime: new Date(2026, 6, 28, 9, 15),
      lastScanTime: new Date(2026, 6, 28, 16, 50),
      shiftInTime: "09:00",
      shiftOutTime: "17:00"
    });
    expect(res.status).toBe("PRESENT");
    expect(res.value).toBe(1.0);
  });

  it("returns HALF_DAY (0.5) when employee comes 3+ hours late (12:30)", () => {
    const res = evaluateShiftAttendance({
      firstScanTime: new Date(2026, 6, 28, 12, 30),
      lastScanTime: new Date(2026, 6, 28, 17, 0),
      shiftInTime: "09:00",
      shiftOutTime: "17:00"
    });
    expect(res.status).toBe("HALF_DAY");
    expect(res.value).toBe(0.5);
    expect(res.reason).toContain("Late arrival");
  });

  it("returns HALF_DAY (0.5) when employee leaves 3+ hours early (13:30)", () => {
    const res = evaluateShiftAttendance({
      firstScanTime: new Date(2026, 6, 28, 9, 0),
      lastScanTime: new Date(2026, 6, 28, 13, 30),
      shiftInTime: "09:00",
      shiftOutTime: "17:00"
    });
    expect(res.status).toBe("HALF_DAY");
    expect(res.value).toBe(0.5);
    expect(res.reason).toContain("Early departure");
  });
});
