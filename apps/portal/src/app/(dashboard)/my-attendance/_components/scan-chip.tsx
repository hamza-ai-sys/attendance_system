import type { DisplayScan } from "../types";

export function ScanChip({ scan, onReview }: { scan: DisplayScan; onReview: () => void }) {
  const review = scan.type === "needs-review";
  function handleKeyDown(event: React.KeyboardEvent) {
    if (review && (event.key === "Enter" || event.key === " ")) onReview();
  }
  return (
    <div
      className={`scan-chip ${scan.type}`}
      onClick={review ? onReview : undefined}
      title={review ? scan.reviewMessage : `${scan.label} recorded at ${scan.timeStr}`}
      role={review ? "button" : undefined}
      tabIndex={review ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <span className="scan-icon">{review ? "⚠️" : scan.type === "check-in" ? "📥" : "📤"}</span>
      <span>{scan.timeStr}</span>
    </div>
  );
}
