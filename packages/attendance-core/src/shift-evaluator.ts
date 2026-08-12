export type AttendanceEvaluationResult = {
  status: "PRESENT" | "HALF_DAY" | "ABSENT";
  value: number; // 1.0, 0.5, 0.0
  reason: string;
};

export function evaluateShiftAttendance(params: {
  firstScanTime: Date | null;
  lastScanTime: Date | null;
  shiftInTime?: string | null; // e.g. "09:00"
  shiftOutTime?: string | null; // e.g. "17:00"
  graceMinutes?: number; // default 20
  halfDayThresholdHours?: number; // default 3
}): AttendanceEvaluationResult {
  const {
    firstScanTime,
    lastScanTime,
    shiftInTime = "09:00",
    shiftOutTime = "17:00",
    graceMinutes = 20,
    halfDayThresholdHours = 3
  } = params;

  if (!firstScanTime) {
    return {
      status: "ABSENT",
      value: 0,
      reason: "No check-in scan recorded"
    };
  }

  const [inHour = 9, inMin = 0] = (shiftInTime || "09:00").split(":").map(Number);
  const [outHour = 17, outMin = 0] = (shiftOutTime || "17:00").split(":").map(Number);

  const shiftInMinutes = inHour * 60 + inMin;
  const shiftOutMinutes = outHour * 60 + outMin;

  const checkIn = new Date(firstScanTime);
  const checkOut = lastScanTime ? new Date(lastScanTime) : checkIn;

  const checkInMinutes = checkIn.getHours() * 60 + checkIn.getMinutes();
  const checkOutMinutes = checkOut.getHours() * 60 + checkOut.getMinutes();

  const lateMinutes = checkInMinutes - shiftInMinutes;
  const earlyMinutes = shiftOutMinutes - checkOutMinutes;

  // Rule: Late by >= 3 hours (180 mins) OR Early departure by >= 3 hours (180 mins) -> Half Day (0.5)
  const isLate3Hours = lateMinutes >= halfDayThresholdHours * 60;
  const isEarly3Hours = earlyMinutes >= halfDayThresholdHours * 60;

  if (isLate3Hours || isEarly3Hours) {
    const reasons: string[] = [];
    if (isLate3Hours)
      reasons.push(`Late arrival by ${Math.floor(lateMinutes / 60)}h ${lateMinutes % 60}m`);
    if (isEarly3Hours)
      reasons.push(`Early departure by ${Math.floor(earlyMinutes / 60)}h ${earlyMinutes % 60}m`);
    return {
      status: "HALF_DAY",
      value: 0.5,
      reason: reasons.join(", ")
    };
  }

  // Rule: Within 20-minute grace window -> Present (1.0)
  const isWithinInGrace = lateMinutes <= graceMinutes;
  const isWithinOutGrace = earlyMinutes <= graceMinutes;

  if (isWithinInGrace && isWithinOutGrace) {
    return {
      status: "PRESENT",
      value: 1.0,
      reason: "Scans within shift schedule and 20-min grace window"
    };
  }

  const totalWorkedMs = Math.max(0, checkOut.getTime() - checkIn.getTime());
  const totalWorkedHours = totalWorkedMs / (1000 * 60 * 60);

  if (totalWorkedHours >= 5) {
    return {
      status: "PRESENT",
      value: 1.0,
      reason: `Worked ${totalWorkedHours.toFixed(1)} hours`
    };
  }

  return {
    status: "HALF_DAY",
    value: 0.5,
    reason: `Worked ${totalWorkedHours.toFixed(1)} hours (< 5 hours standard)`
  };
}
