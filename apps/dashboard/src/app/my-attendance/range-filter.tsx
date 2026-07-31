"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Route } from "next";

export function MyAttendanceRangeFilter({
  currentRange
}: {
  currentRange: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "last_week") {
      params.set("range", value);
    } else {
      params.delete("range");
    }
    router.push(`${pathname}?${params.toString()}` as Route);
  };

  const selectStyle = {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#f8fafc",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "0.88rem",
    fontWeight: 500,
    outline: "none",
    cursor: "pointer",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)"
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <label htmlFor="my-range-select" className="muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
        Period:
      </label>
      <select
        id="my-range-select"
        value={currentRange}
        onChange={(e) => handleRangeChange(e.target.value)}
        style={selectStyle}
      >
        <option value="today" style={{ background: "#1e1b4b", color: "#fff" }}>Last Day / Today</option>
        <option value="last_week" style={{ background: "#1e1b4b", color: "#fff" }}>Last Week (7 Days)</option>
        <option value="last_month" style={{ background: "#1e1b4b", color: "#fff" }}>Last Month (30 Days)</option>
        <option value="all_time" style={{ background: "#1e1b4b", color: "#fff" }}>All Time / All Months</option>
      </select>
    </div>
  );
}
