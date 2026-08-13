import { deleteHoliday } from "../actions";
import type { getWorkCalendarData } from "../queries";

type Holiday = Awaited<ReturnType<typeof getWorkCalendarData>>["holidays"][number];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function HolidaysTable({ holidays }: { holidays: Holiday[] }) {
  return (
    <section className="panel" style={{ cursor: "default", marginTop: 24, display: "block" }}>
      <h2>Official Company Holidays ({holidays.length})</h2>
      <p className="muted">Registered holiday dates and exemptions</p>
      {holidays.length === 0 ? (
        <p className="muted">No holidays added yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Holiday Name</th>
                <th>Date</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id}>
                  <td>
                    <strong>{holiday.name}</strong>
                  </td>
                  <td style={{ color: "#60a5fa" }}>{formatDate(holiday.date)}</td>
                  <td className="muted">{holiday.description || "—"}</td>
                  <td>
                    <form action={deleteHoliday}>
                      <input type="hidden" name="id" value={holiday.id} />
                      <button type="submit" className="danger-btn">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
