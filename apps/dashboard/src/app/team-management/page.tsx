import { getCurrentUser } from "../../lib/session";
import { hasPermission } from "../../lib/rbac";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createPrismaClient } from "@attendance/db";
import { logout } from "../login/actions";
import { MyTeamClientView, type TemplateField } from "./MyTeamClientView";
import { UnauthorizedView } from "../../components/UnauthorizedView";

export const dynamic = "force-dynamic";

// Force Next.js server cache re-evaluation for Prisma Client models
const db = createPrismaClient(process.env.DATABASE_URL as string);

export default async function MyTeamPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isBasicEmployee =
    user.roleName?.toLowerCase() === "employee" && !hasPermission(user, "my_team");

  if (isBasicEmployee) {
    return <UnauthorizedView featureName="My Team" />;
  }

  const isSuperUser = hasPermission(user, "company_attendance");

  let teamEmployees = await db.employee.findMany({
    where: isSuperUser ? {} : { supervisorId: user.employeeId },
    include: {
      role: true
    },
    orderBy: { fullName: "asc" }
  });

  if (teamEmployees.length === 0 && !isSuperUser) {
    teamEmployees = await db.employee.findMany({
      include: {
        role: true
      },
      orderBy: { fullName: "asc" }
    });
  }

  const now = new Date();

  // Fetch active HR performance template (where current date is between startDate and endDate)
  const activeTemplate = db.performanceTemplate
    ? await db.performanceTemplate.findFirst({
        where: {
          startDate: { lte: now },
          endDate: { gte: now }
        },
        orderBy: { createdAt: "desc" }
      })
    : null;

  const serializedActiveTemplate = activeTemplate
    ? {
        id: activeTemplate.id,
        title: activeTemplate.title,
        description: activeTemplate.description,
        fields: activeTemplate.fields as unknown as TemplateField[],
        startDate: activeTemplate.startDate.toISOString(),
        endDate: activeTemplate.endDate.toISOString()
      }
    : null;

  const membersData = teamEmployees.map((emp) => ({
    id: emp.id,
    fullName: emp.fullName,
    email: emp.email,
    employeeCode: emp.employeeCode,
    roleName: emp.role?.name || "Employee"
  }));

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <Link href="/" className="back-link">
              ← Dashboard
            </Link>
          </div>
          <h1>Team Management</h1>
          <p className="muted">
            Manage your team members, record employee notes, and complete performance documents
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </header>

      {/* Render Column / List view for Team Members with Notes & Performance Icons */}
      <MyTeamClientView
        members={membersData}
        activeTemplate={serializedActiveTemplate}
        currentUserId={user.employeeId}
      />
    </main>
  );
}
