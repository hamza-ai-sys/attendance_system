export function AttendanceSummary({
  bannerTitle,
  dateRange,
  totalScans,
  daysPresent,
  totalDays
}: {
  bannerTitle: string;
  dateRange: string;
  totalScans: number;
  daysPresent: number;
  totalDays: number;
}) {
  const average = daysPresent > 0 ? (totalScans / daysPresent).toFixed(1) : "0";
  return (
    <>
      <section className="banner">
        <div className="banner-info">
          <span className="banner-title">{bannerTitle}</span>
          <span className="banner-dates">{dateRange}</span>
        </div>
      </section>
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Scans</span>
          <span className="stat-value">{totalScans}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Days Present</span>
          <span className="stat-value">
            {daysPresent} / {totalDays}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Scans / Active Day</span>
          <span className="stat-value">{average}</span>
        </div>
      </section>
    </>
  );
}
