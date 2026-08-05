"use server";

import { getCurrentUser } from "../../lib/session";
import { createPrismaClient } from "@attendance/db";
import { revalidatePath } from "next/cache";
import { isHr } from "./permissions";

const db = createPrismaClient(process.env.DATABASE_URL as string);

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const APPLICATION_STATUSES = ["SUBMITTED", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"] as const;

export type JobPostingState = { error?: string; success?: string };

export async function createJobPosting(
  prevState: JobPostingState,
  formData: FormData
): Promise<JobPostingState> {
  const user = await getCurrentUser();

  if (!isHr(user)) {
    return { error: "Unauthorized: Only HR can create job postings." };
  }

  const title = (formData.get("title") as string)?.trim();
  const department = (formData.get("department") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const employmentType = (formData.get("employmentType") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!title) {
    return { error: "Job title is required." };
  }

  if (!description) {
    return { error: "Job description is required." };
  }

  await db.jobPosting.create({
    data: {
      title,
      department: department || null,
      location: location || null,
      employmentType: employmentType || null,
      description,
      createdById: user!.employeeId
    }
  });

  revalidatePath("/jobs");
  revalidatePath("/");

  return { success: `Job posting "${title}" has been published.` };
}

export async function setJobPostingStatus(formData: FormData) {
  const user = await getCurrentUser();

  if (!isHr(user)) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id || (status !== "OPEN" && status !== "CLOSED")) {
    return;
  }

  await db.jobPosting.update({
    where: { id },
    data: { status }
  });

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  revalidatePath(`/jobs/${id}/applications`);
}

export async function deleteJobPosting(formData: FormData) {
  const user = await getCurrentUser();

  if (!isHr(user)) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  if (!id) return;

  await db.jobPosting.delete({ where: { id } });

  revalidatePath("/jobs");
}

export type ApplicationState = { error?: string; success?: string };

export async function submitApplication(
  prevState: ApplicationState,
  formData: FormData
): Promise<ApplicationState> {
  const jobPostingId = formData.get("jobPostingId") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const cv = formData.get("cv");

  if (!jobPostingId) {
    return { error: "Missing job posting reference." };
  }

  if (!fullName) {
    return { error: "Full name is required." };
  }

  if (!phone) {
    return { error: "Phone number is required." };
  }

  if (!email || !email.includes("@")) {
    return { error: "A valid email address is required." };
  }

  if (!(cv instanceof File) || cv.size === 0) {
    return { error: "Please attach your CV." };
  }

  if (!ALLOWED_CV_TYPES.has(cv.type)) {
    return { error: "CV must be a PDF or Word document (.pdf, .doc, or .docx)." };
  }

  if (cv.size > MAX_CV_SIZE_BYTES) {
    return { error: "CV file must be smaller than 5MB." };
  }

  const job = await db.jobPosting.findUnique({ where: { id: jobPostingId } });

  if (!job) {
    return { error: "This job posting no longer exists." };
  }

  if (job.status !== "OPEN") {
    return { error: "This job posting is no longer accepting applications." };
  }

  const buffer = Buffer.from(await cv.arrayBuffer());

  await db.jobApplication.create({
    data: {
      jobPostingId,
      fullName,
      phone,
      email,
      cvFileName: cv.name || "cv",
      cvFileType: cv.type || "application/octet-stream",
      cvFileSize: cv.size,
      cvFileData: buffer
    }
  });

  revalidatePath(`/jobs/${jobPostingId}/applications`);

  return { success: "Your application has been submitted. Thank you for applying!" };
}

export async function updateApplicationStatus(formData: FormData) {
  const user = await getCurrentUser();

  if (!isHr(user)) {
    throw new Error("Unauthorized");
  }

  const applicationId = formData.get("applicationId") as string;
  const jobPostingId = formData.get("jobPostingId") as string;
  const status = formData.get("status") as string;

  if (!applicationId || !(APPLICATION_STATUSES as readonly string[]).includes(status)) {
    return;
  }

  await db.jobApplication.update({
    where: { id: applicationId },
    data: { status: status as (typeof APPLICATION_STATUSES)[number] }
  });

  revalidatePath(`/jobs/${jobPostingId}/applications`);
}
