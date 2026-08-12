import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireCurrentUser } from "../../../../../lib/session";
import { logout } from "../../../../login/actions";
import { isHr } from "../../../permissions";
import { ApplicationResponses } from "./_components/application-responses";
import { getApplicationDetail } from "./queries";

export const dynamic = "force-dynamic";
export default async function ApplicationDetailPage({
  params
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const user = await requireCurrentUser();
  if (!isHr(user)) redirect("/jobs");
  const { id, applicationId } = await params;
  const data = await getApplicationDetail(id, applicationId);
  if (!data.application || data.application.jobPosting.id !== id) notFound();
  const application = data.application;
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <Link href={`/jobs/${id}/applications`} className="back-link">
            ← Responses
          </Link>
          <h1>{application.fullName}</h1>
          <p className="muted">Applied for {application.jobPosting.title}</p>
        </div>
        <form action={logout}>
          <button className="logout-btn">Sign Out</button>
        </form>
      </header>
      <section className="panel">
        <h2>Contact Details</h2>
        <p>{application.email}</p>
        <p className="muted">{application.phone}</p>
        <a href={`/jobs/${id}/applications/${application.id}/cv`} className="back-link">
          Download CV
        </a>
      </section>
      <ApplicationResponses steps={data.steps} responses={application.stepResponses} />
    </main>
  );
}
