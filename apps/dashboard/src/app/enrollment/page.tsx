import { redirect } from "next/navigation";

export default function LegacyEnrollmentPage() {
  redirect("/employees/new");
}
