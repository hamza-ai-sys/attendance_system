import { getCurrentUser } from "../../../lib/session";
import { hasAccess } from "../../../lib/rbac";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createPrismaClient } from "@attendance/db";
import { logout } from "../../login/actions";
import { EnrollmentForm } from "./enrollment-form";
import { UnauthorizedView } from "../../../components/UnauthorizedView";

export const dynamic = "force-dynamic";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export default async function EnrollmentPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasAccess(user, ["enrollment", "company_attendance"])) {
    return <UnauthorizedView featureName="Employee Enrollment" />;
  }

  // Fetch roles and potential managers for the form dropdowns
  const roles = await db.role.findMany({
    orderBy: { name: "asc" }
  });

  const potentialManagers = await db.employee.findMany({
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: "asc" }
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Add Employee</h1>
          <p className="muted">
            Logged in as <strong>{user.fullName}</strong> ({user.roleName})
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/" className="back-link">
            ← Dashboard
          </Link>
          <form action={logout}>
            <button type="submit" className="logout-btn">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <section>
        <EnrollmentForm
          roles={roles.map((r) => ({ id: r.id, name: r.name }))}
          managers={potentialManagers}
        />
      </section>
    </main>
  );
}
