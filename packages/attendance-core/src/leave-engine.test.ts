import { describe, expect, it } from "vitest";
import {
  calculateAccruedLeave,
  calculateWorkingDays,
  calculateAvailableBalance
} from "./leave-engine";

describe("Leave Engine", () => {
  describe("calculateAccruedLeave", () => {
    it("should return full allocation for annual accrual frequency", () => {
      const result = calculateAccruedLeave({
        allocated: 14,
        accrualFrequency: "ANNUALLY"
      });
      expect(result).toBe(14);
    });

    it("should return full monthly allowance for monthly accrual frequency", () => {
      const resultMonthly = calculateAccruedLeave({
        allocated: 4,
        accrualFrequency: "MONTHLY"
      });
      expect(resultMonthly).toBe(4);
    });
  });

  describe("calculateWorkingDays", () => {
    it("should exclude Sundays (offDays=[0]) by default", () => {
      // Mon 2026-06-01 to Sun 2026-06-07 -> 6 working days (Mon-Sat)
      const start = new Date("2026-06-01T00:00:00Z");
      const end = new Date("2026-06-07T00:00:00Z");
      const days = calculateWorkingDays(start, end, [], [0]);
      expect(days).toBe(6);
    });

    it("should exclude company holidays", () => {
      // Mon 2026-06-01 to Fri 2026-06-05 with Wed 2026-06-03 as holiday -> 4 working days
      const start = new Date("2026-06-01T00:00:00Z");
      const end = new Date("2026-06-05T00:00:00Z");
      const holiday = new Date("2026-06-03T00:00:00Z");
      const days = calculateWorkingDays(start, end, [holiday], [0]);
      expect(days).toBe(4);
    });

    it("should return 0 if start date is after end date", () => {
      const start = new Date("2026-06-05T00:00:00Z");
      const end = new Date("2026-06-01T00:00:00Z");
      const days = calculateWorkingDays(start, end);
      expect(days).toBe(0);
    });
  });

  describe("calculateAvailableBalance", () => {
    it("should calculate accrued + carriedOver - used", () => {
      const available = calculateAvailableBalance(7.0, 2.0, 3.0);
      expect(available).toBe(6.0);
    });

    it("should not return negative balance", () => {
      const available = calculateAvailableBalance(5.0, 0, 8.0);
      expect(available).toBe(0);
    });
  });
});
