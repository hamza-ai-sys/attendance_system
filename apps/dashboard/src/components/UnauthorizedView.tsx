import Link from "next/link";

interface UnauthorizedViewProps {
  featureName?: string;
  message?: string;
}

export function UnauthorizedView({ featureName, message }: UnauthorizedViewProps) {
  const displayMessage =
    message || `Unauthorized: You do not have permission to access ${featureName || "this page"}.`;

  return (
    <main className="app-shell">
      <div className="banner" style={{ borderColor: "#ef4444" }}>
        <p>{displayMessage}</p>
      </div>
      <Link href="/" className="back-link">
        ← Back to Dashboard
      </Link>
    </main>
  );
}
