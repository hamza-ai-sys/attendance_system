import { createPrismaClient } from "@attendance/db";

const db = createPrismaClient(process.env.DATABASE_URL as string);
export function getJobApplications(id: string) {
  return db.jobPosting.findUnique({
    where: { id },
    include: { applications: { orderBy: { createdAt: "desc" } } }
  });
}
