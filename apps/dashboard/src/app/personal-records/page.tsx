import { getCurrentUser } from "../../lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createPrismaClient } from "@attendance/db";
import { logout } from "../login/actions";
import { PersonalRecordsForm } from "./personal-records-form";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export default async function PersonalRecordsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const employee = await db.employee.findUnique({
    where: { id: user.employeeId },
    include: { role: true }
  });

  if (!employee) {
    redirect("/login");
  }

  const initialData = {
    fullName: employee.fullName,
    email: employee.email,
    employeeCode: employee.employeeCode,
    roleName: employee.role?.name || "employee",
    phone: employee.phone,
    dateOfBirth: employee.dateOfBirth,
    gender: employee.gender,
    maritalStatus: employee.maritalStatus,
    currentAddress: employee.currentAddress,
    permanentAddress: employee.permanentAddress,
    emergencyContactName: employee.emergencyContactName,
    emergencyContactPhone: employee.emergencyContactPhone
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <Link href="/" className="back-link">
              ← Dashboard
            </Link>
          </div>
          <h1>My Personal Records</h1>
          <p className="muted">
            Manage your personal bio-data, contact details, and emergency information
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </header>

      <section>
        <PersonalRecordsForm initialData={initialData} />
      </section>
    </main>
  );
}
