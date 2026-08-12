import Link from "next/link";
import { updateApplicationStatus } from "../../../actions";
import type { getJobApplications } from "../queries";

type Job = NonNullable<Awaited<ReturnType<typeof getJobApplications>>>;
const statuses = ["SUBMITTED", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"] as const;

function ApplicationRow({
  jobId,
  application
}: {
  jobId: string;
  application: Job["applications"][number];
}) {
  return (
    <tr>
      <td>
        <Link href={`/jobs/${jobId}/applications/${application.id}`} className="back-link">
          {application.fullName}
        </Link>
      </td>
      <td>
        {application.email}
        <div className="muted">{application.phone}</div>
      </td>
      <td className="muted">
        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
          application.createdAt
        )}
      </td>
      <td>
        <a href={`/jobs/${jobId}/applications/${application.id}/cv`} className="back-link">
          Download CV
        </a>
      </td>
      <td>
        <form action={updateApplicationStatus} style={{ display: "flex", gap: 8 }}>
          <input type="hidden" name="applicationId" value={application.id} />
          <input type="hidden" name="jobPostingId" value={jobId} />
          <select name="status" defaultValue={application.status} className="form-control">
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <button type="submit" className="back-link">
            Update
          </button>
        </form>
      </td>
    </tr>
  );
}

export function ApplicationsTable({ job }: { job: Job }) {
  if (!job.applications.length)
    return (
      <section className="panel">
        <p className="muted">No one has applied to this position yet.</p>
      </section>
    );
  return (
    <section className="panel">
      <div style={{ overflowX: "auto" }}>
        <table className="directory-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Contact</th>
              <th>Applied</th>
              <th>CV</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {job.applications.map((application) => (
              <ApplicationRow key={application.id} jobId={job.id} application={application} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
