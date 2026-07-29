export interface LeaveAccrualParams {
  allocated: number;
  accrualFrequency: "MONTHLY" | "ANNUALLY";
  referenceDate?: Date;
}

export function calculateAccruedLeave(params: LeaveAccrualParams): number {
  const { allocated, accrualFrequency } = params;

  if (accrualFrequency === "ANNUALLY") {
    return allocated;
  }

  // Monthly accrual: 'allocated' is the monthly allowance (e.g. 4 days per month)
  return allocated;
}

export function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  holidays: Date[] = [],
  offDays: number[] = [0] // Default Sunday as weekend off-day
): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (start > end) {
    return 0;
  }

  let workingDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isWeekend = offDays.includes(dayOfWeek);

    const isHoliday = holidays.some((h) => {
      const hd = new Date(h);
      return (
        hd.getFullYear() === current.getFullYear() &&
        hd.getMonth() === current.getMonth() &&
        hd.getDate() === current.getDate()
      );
    });

    if (!isWeekend && !isHoliday) {
      workingDays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return workingDays;
}

export function calculateAvailableBalance(
  accrued: number,
  carriedOver: number,
  used: number
): number {
  return Math.max(0, Math.round((accrued + carriedOver - used) * 10) / 10);
}
