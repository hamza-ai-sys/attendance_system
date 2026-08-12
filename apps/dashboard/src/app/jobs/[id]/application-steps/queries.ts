import { createPrismaClient } from "@attendance/db";
import { employmentIdentityInclude, getEmploymentName } from "../../../../lib/employment";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export async function getJobStepsData(id: string) {
  const [job, employmentRecords] = await Promise.all([
    db.jobPosting.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: { interviewer: { include: employmentIdentityInclude } }
        }
      }
    }),
    db.employment.findMany({
      where: { status: "ACTIVE" },
      include: employmentIdentityInclude,
      orderBy: { employeeCode: "asc" }
    })
  ]);
  const employees = employmentRecords.map((employment) => ({
    id: employment.id,
    fullName: getEmploymentName(employment)
  }));
  return {
    job: job
      ? {
          ...job,
          steps: job.steps.map((step) => ({
            ...step,
            interviewer: step.interviewer
              ? { fullName: getEmploymentName(step.interviewer) }
              : null
          }))
        }
      : null,
    employees
  };
}
