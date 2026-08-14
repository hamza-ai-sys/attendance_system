import Link from "next/link";
import { logout } from "../../../(auth)/login/actions";
import { CompanyRangeFilter } from "./company-range-filter";
import type { CompanyAttendanceRange, SimpleEmployee } from "../types";

type CompanyAttendanceHeaderProps = {
  employees: SimpleEmployee[];
  range: CompanyAttendanceRange;
  selectedEmployeeId: string;
  subtitle: string;
};

export function CompanyAttendanceHeader({
  employees,
  range,
  selectedEmployeeId,
  subtitle
}: CompanyAttendanceHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <Link href="/" className="back-link">
          ← Home
        </Link>
        <h1>Company Attendance Metrics</h1>
        <p className="muted">{subtitle}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <CompanyRangeFilter
          currentRange={range}
          currentEmployeeId={selectedEmployeeId}
          employees={employees}
        />
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}
