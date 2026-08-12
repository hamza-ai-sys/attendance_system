import { createPrismaClient } from "@attendance/db";
import { getEmployeeNotes } from "../../../team-attendance/actions";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export async function getNotesHistoryData(employeeId: string) {
  const [employee, notes] = await Promise.all([
    db.employee.findUnique({ where: { id: employeeId }, include: { role: true } }),
    getEmployeeNotes(employeeId)
  ]);
  return { employee, notes };
}
