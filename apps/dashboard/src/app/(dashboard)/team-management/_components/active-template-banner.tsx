import type { ActivePerformanceTemplate } from "../types";

export function ActiveTemplateBanner({ template }: { template: ActivePerformanceTemplate }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg,rgba(245,158,11,.15),rgba(236,72,153,.15))",
        border: "1px solid rgba(245,158,11,.4)",
        borderRadius: 16,
        padding: "18px 24px"
      }}
    >
      <h3 style={{ margin: "0 0 4px", color: "#fbbf24" }}>
        ✨ Performance Evaluation Window Active
      </h3>
      <p style={{ margin: 0, color: "#cbd5e1" }}>
        HR Form: <strong>{template.title}</strong> (Active:{" "}
        {new Date(template.startDate).toLocaleDateString()} to{" "}
        {new Date(template.endDate).toLocaleDateString()})
      </p>
    </div>
  );
}
