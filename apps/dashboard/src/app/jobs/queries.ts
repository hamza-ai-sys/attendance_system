import { createPrismaClient } from "@attendance/db";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export function getJobPostings(includeClosed: boolean) {
  return db.jobPosting.findMany({
    where: includeClosed ? {} : { status: "OPEN" },
    include: { _count: { select: { applications: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });
}
