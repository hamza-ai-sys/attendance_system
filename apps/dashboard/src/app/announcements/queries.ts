import { createPrismaClient } from "@attendance/db";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export function getAnnouncements() {
  return db.announcement.findMany({
    include: { createdBy: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export function markAnnouncementsViewed(employeeId: string) {
  return db.employee.update({
    where: { id: employeeId },
    data: { lastAnnouncementsViewedAt: new Date() }
  });
}
