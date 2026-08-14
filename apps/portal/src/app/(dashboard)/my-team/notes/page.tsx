import { redirect } from "next/navigation";

type LegacyNotesPageProps = {
  searchParams: Promise<{ employeeId?: string }>;
};

export default async function LegacyNotesPage({ searchParams }: LegacyNotesPageProps) {
  const { employeeId } = await searchParams;
  redirect(employeeId ? `/team-management/${employeeId}/notes` : "/team-management");
}
