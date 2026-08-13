"use client";

import { useState } from "react";
import { ManualRequestModal } from "../my-attendance-correction-requests/manual-request-modal";
import { DayStatus, HalfDayStatus } from "./_components/day-status";
import { ScanChip } from "./_components/scan-chip";
import { ScanReviewModal, type ReviewModalInfo } from "./_components/scan-review-modal";
import type { WeekdayData } from "./types";

function AttendanceDay({
  day,
  onReview
}: {
  day: WeekdayData;
  onReview: (info: ReviewModalInfo) => void;
}) {
  if (!day.scans.length)
    return (
      <div style={{ padding: "8px 0" }}>
        <DayStatus day={day} />
      </div>
    );
  return (
    <div className="scans-container">
      {day.scans.map((scan) => (
        <ScanChip
          key={scan.id}
          scan={scan}
          onReview={() => onReview({ scan, dayName: day.dayName, dateStr: day.dateStr })}
        />
      ))}
      {day.status === "HALF_DAY" && (
        <div style={{ marginTop: 6 }}>
          <HalfDayStatus reason={day.evaluationReason} />
        </div>
      )}
    </div>
  );
}

export function WeeklyAttendanceView({ weekdays }: { weekdays: WeekdayData[] }) {
  const [review, setReview] = useState<ReviewModalInfo | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  function openRequest() {
    setReview(null);
    setModalKey((value) => value + 1);
    setRequestOpen(true);
  }
  return (
    <>
      <section className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              {weekdays.map((day) => (
                <th key={`${day.dayName}-${day.dateStr}`}>
                  <span className="weekday-name">{day.dayName}</span>
                  <span className="weekday-date">{day.dateStr}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekdays.map((day) => (
                <td key={`${day.dayName}-${day.dateStr}`}>
                  <AttendanceDay day={day} onReview={setReview} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>
      {review && (
        <ScanReviewModal info={review} onClose={() => setReview(null)} onRequest={openRequest} />
      )}
      <ManualRequestModal
        key={modalKey}
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
      />
    </>
  );
}
