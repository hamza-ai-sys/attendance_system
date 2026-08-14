import { getCurrentUser } from "../../../lib/session";
import { hasAccess } from "../../../lib/rbac";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createPrismaClient } from "@attendance/db";
import { logout } from "../../(auth)/login/actions";
import { PerformanceClientView } from "./performance-client-view";
import type { FieldDefinition } from "./actions";
import { UnauthorizedView } from "../../../components/unauthorized-view";
import {
  employmentAccessInclude,
  getEmploymentEmail,
  getEmploymentName,
  getEmploymentRoleKey
} from "../../../lib/employment";

export const dynamic = "force-dynamic";

// Force Next.js server cache re-evaluation for Prisma Client models
const db = createPrismaClient(process.env.DATABASE_URL as string);

interface RawTemplate {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  fields: unknown;
  createdAt: Date;
  createdBy: { fullName: string };
  _count: { evaluations: number };
}

interface RawEvaluation {
  id: string;
  overallScore: number | null;
  comments: string | null;
  submittedAt: Date;
  responses: unknown;
  template: {
    title: string;
    fields: unknown;
  };
  employee: {
    fullName: string;
    email: string;
  };
  evaluator: {
    fullName: string;
    role: { name: string } | null;
  };
}

export default async function PerformancePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasAccess(user, ["reports", "company_attendance"])) {
    return <UnauthorizedView featureName="Performance Tracking & Analysis" />;
  }

  // Fetch performance templates
  const rawTemplates = db.performanceTemplate
    ? await db.performanceTemplate.findMany({
        include: {
          createdBy: { include: { person: true } },
          _count: { select: { evaluations: true } }
        },
        orderBy: { createdAt: "desc" }
      })
    : [];

  const templates = (rawTemplates as unknown as RawTemplate[]).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    fields: t.fields as unknown as FieldDefinition[],
    createdAt: t.createdAt.toISOString(),
    creatorName:
      (t.createdBy as unknown as { person: { legalName: string; preferredName: string | null } })
        .person.preferredName ??
      (t.createdBy as unknown as { person: { legalName: string } }).person.legalName,
    evaluationCount: t._count.evaluations
  }));

  // Fetch submitted evaluations
  const rawEvaluations = db.performanceEvaluation
    ? await db.performanceEvaluation.findMany({
        include: {
          template: true,
          employee: { include: employmentAccessInclude() },
          evaluator: { include: employmentAccessInclude() }
        },
        orderBy: { submittedAt: "desc" }
      })
    : [];

  const evaluations = (rawEvaluations as unknown as RawEvaluation[]).map((ev) => ({
    id: ev.id,
    templateTitle: ev.template.title,
    employeeName: getEmploymentName(ev.employee as never),
    employeeEmail: getEmploymentEmail(ev.employee as never),
    evaluatorName: getEmploymentName(ev.evaluator as never),
    evaluatorRole: getEmploymentRoleKey(ev.evaluator as never),
    overallScore: ev.overallScore,
    comments: ev.comments,
    submittedAt: ev.submittedAt.toISOString(),
    responses: ev.responses as Record<string, string | number>,
    fields: ev.template.fields as unknown as FieldDefinition[]
  }));

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <Link href="/" className="back-link">
              ← Home
            </Link>
          </div>
          <h1>Performance Tracking & Analysis</h1>
          <p className="muted">
            HR workspace for evaluation form definition and organizational performance analytics
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </header>

      <PerformanceClientView templates={templates} evaluations={evaluations} />
    </main>
  );
}
