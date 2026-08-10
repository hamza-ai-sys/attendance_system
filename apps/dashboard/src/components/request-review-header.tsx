import Link from "next/link";
import { logout } from "../app/login/actions";

type RequestReviewHeaderProps = {
  title: string;
  description: string;
  reviewerName: string;
};

export function RequestReviewHeader({
  title,
  description,
  reviewerName
}: RequestReviewHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <Link href="/" className="back-link">
          ← Dashboard
        </Link>
        <h1>{title}</h1>
        <p className="muted">
          {description} Reviewing as <strong>{reviewerName}</strong>.
        </p>
      </div>
      <form action={logout}>
        <button type="submit" className="logout-btn">
          Sign Out
        </button>
      </form>
    </header>
  );
}
