import { createPrismaClient } from "@attendance/db";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export async function getJobStepsData(id: string) {
  const [job, employees] = await Promise.all([
    db.jobPosting.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: { interviewer: { select: { fullName: true } } }
        }
      }
    }),
    db.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" }
    })
  ]);
  return { job, employees };
}
