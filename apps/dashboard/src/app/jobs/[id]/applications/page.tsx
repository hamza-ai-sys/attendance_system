import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireCurrentUser } from "../../../../lib/session";
import { logout } from "../../../login/actions";
import { isHr } from "../../permissions";
import { ApplicationsTable } from "./_components/applications-table";
import { getJobApplications } from "./queries";

export const dynamic = "force-dynamic";
export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  if (!isHr(user)) redirect("/jobs");
  const { id } = await params;
  const job = await getJobApplications(id);
  if (!job) notFound();
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <Link href="/jobs" className="back-link">
            ← Jobs
          </Link>
          <h1>Responses: {job.title}</h1>
          <p className="muted">
            {job.applications.length} application{job.applications.length === 1 ? "" : "s"} received
          </p>
        </div>
        <div>
          <Link href={`/jobs/${id}`} className="back-link">
            View Posting
          </Link>
          <form action={logout}>
            <button className="logout-btn">Sign Out</button>
          </form>
        </div>
      </header>
      <ApplicationsTable job={job} />
    </main>
  );
}
