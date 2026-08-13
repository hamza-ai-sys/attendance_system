import type { CompanyAttendanceScan } from "../types";

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(date);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function PunchStream({
  rangeTitle,
  scans,
  selectedEmployeeName
}: {
  rangeTitle: string;
  scans: CompanyAttendanceScan[];
  selectedEmployeeName?: string;
}) {
  const title = selectedEmployeeName
    ? `Punch Stream: ${selectedEmployeeName}`
    : `Terminal Punch Stream (${rangeTitle})`;

  return (
    <section className="panel" style={{ cursor: "default" }}>
      <h2>{title}</h2>
      <p className="muted" style={{ marginBottom: "20px" }}>
        Latest scan events received in this period
      </p>
      {scans.length === 0 ? (
        <p className="muted">No scans recorded for selected filter.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {scans.slice(0, 10).map((scan) => (
            <li key={scan.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{scan.employee?.fullName || `Template #${scan.scannerTemplateId}`}</strong>
                <div className="muted" style={{ fontSize: "0.8rem" }}>
                  Device: {scan.device.name} ({scan.device.location || "Default"})
                </div>
              </div>
              <span style={{ fontSize: "0.85rem", color: "#a7f3d0" }}>
                {formatDate(scan.serverReceivedAt)} {formatTime(scan.serverReceivedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
