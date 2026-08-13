import { createPrismaClient } from "@attendance/db";
import { employmentIdentityInclude, getEmploymentName } from "../../../../../../lib/employment";
const db = createPrismaClient(process.env.DATABASE_URL as string);
export async function getApplicationDetail(jobId: string, applicationId: string) {
  const [application, steps] = await Promise.all([
    db.jobApplication.findUnique({
      where: { id: applicationId },
      include: { jobPosting: { select: { id: true, title: true } }, stepResponses: true }
    }),
    db.jobPostingStep.findMany({
      where: { jobPostingId: jobId },
      orderBy: { order: "asc" },
      include: { interviewer: { include: employmentIdentityInclude } }
    })
  ]);
  return {
    application,
    steps: steps.map((step) => ({
      ...step,
      interviewer: step.interviewer ? { fullName: getEmploymentName(step.interviewer) } : null
    }))
  };
}
