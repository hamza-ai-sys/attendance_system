import { redirect } from "next/navigation";

type LegacyJobStepsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyJobStepsPage({ params }: LegacyJobStepsPageProps) {
  const { id } = await params;
  redirect(`/jobs/${id}/application-steps`);
}
