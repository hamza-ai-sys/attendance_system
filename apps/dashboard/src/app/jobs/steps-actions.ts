"use server";

import { getCurrentUser } from "../../lib/session";
import { createPrismaClient } from "@attendance/db";
import { revalidatePath } from "next/cache";
import { isHr } from "./permissions";
import { generateDaySlots, type EmailCvStepConfig, type QuestionnaireStepConfig, type JobStepQuestion } from "./step-types";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export type StepFormState = { error?: string; success?: string };

export async function addJobStep(prevState: StepFormState, formData: FormData): Promise<StepFormState> {
  const user = await getCurrentUser();

  if (!isHr(user)) {
    return { error: "Unauthorized: Only HR can configure job steps." };
  }

  const jobPostingId = formData.get("jobPostingId") as string;
  const type = formData.get("type") as string;

  if (!jobPostingId) {
    return { error: "Missing job posting reference." };
  }

  const job = await db.jobPosting.findUnique({ where: { id: jobPostingId } });
  if (!job) {
    return { error: "This job posting no longer exists." };
  }

  const lastStep = await db.jobPostingStep.findFirst({
    where: { jobPostingId },
    orderBy: { order: "desc" }
  });
  const nextOrder = (lastStep?.order ?? -1) + 1;

  if (type === "EMAIL_CV") {
    const email = (formData.get("email") as string)?.trim();
    const instructions = (formData.get("instructions") as string)?.trim();

    if (!email || !email.includes("@")) {
      return { error: "A valid email address is required for this step." };
    }

    const config: EmailCvStepConfig = { email, instructions: instructions || undefined };

    await db.jobPostingStep.create({
      data: {
        jobPostingId,
        type: "EMAIL_CV",
        order: nextOrder,
        config: JSON.parse(JSON.stringify(config))
      }
    });
  } else if (type === "QUESTIONNAIRE") {
    const questionsRaw = formData.get("questionsJson") as string;

    let questions: JobStepQuestion[];
    try {
      questions = JSON.parse(questionsRaw);
    } catch {
      return { error: "Could not read the questionnaire questions. Please try again." };
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return { error: "Add at least one question to the questionnaire." };
    }

    for (const q of questions) {
      if (!q.prompt || !q.prompt.trim()) {
        return { error: "Every question needs a prompt." };
      }
      if (q.type === "MULTIPLE_CHOICE" && (!q.options || q.options.filter((o) => o.trim()).length < 2)) {
        return { error: `Question "${q.prompt}" needs at least two options.` };
      }
    }

    const config: QuestionnaireStepConfig = { questions };

    await db.jobPostingStep.create({
      data: {
        jobPostingId,
        type: "QUESTIONNAIRE",
        order: nextOrder,
        config: JSON.parse(JSON.stringify(config))
      }
    });
  } else if (type === "INTERVIEW") {
    const interviewMode = formData.get("interviewMode") as string;
    const interviewerId = formData.get("interviewerId") as string;
    const location = (formData.get("location") as string)?.trim();
    const availabilityStartRaw = formData.get("availabilityStart") as string;
    const availabilityEndRaw = formData.get("availabilityEnd") as string;
    const dailyStartTime = formData.get("dailyStartTime") as string;
    const dailyEndTime = formData.get("dailyEndTime") as string;

    if (interviewMode !== "ONLINE" && interviewMode !== "PHYSICAL") {
      return { error: "Please choose an interview type." };
    }

    if (!interviewerId) {
      return { error: "Please choose an interviewer." };
    }

    if (interviewMode === "PHYSICAL" && !location) {
      return { error: "Please provide a location for the physical interview." };
    }

    if (!availabilityStartRaw || !availabilityEndRaw) {
      return { error: "Please choose an availability date range." };
    }

    if (!dailyStartTime || !dailyEndTime) {
      return { error: "Please choose the daily interview hours." };
    }

    const availabilityStart = new Date(`${availabilityStartRaw}T00:00:00`);
    const availabilityEnd = new Date(`${availabilityEndRaw}T23:59:59`);

    if (availabilityEnd < availabilityStart) {
      return { error: "The availability end date must be after the start date." };
    }

    if (dailyEndTime <= dailyStartTime) {
      return { error: "Daily end time must be after the start time." };
    }

    if (generateDaySlots(dailyStartTime, dailyEndTime).length === 0) {
      return { error: "The daily hours must allow at least one 30-minute slot." };
    }

    await db.jobPostingStep.create({
      data: {
        jobPostingId,
        type: "INTERVIEW",
        order: nextOrder,
        interviewMode,
        interviewerId,
        location: interviewMode === "PHYSICAL" ? location : null,
        availabilityStart,
        availabilityEnd,
        dailyStartTime,
        dailyEndTime
      }
    });
  } else {
    return { error: "Unknown step type." };
  }

  revalidatePath(`/jobs/${jobPostingId}/steps`);

  return { success: "Step added." };
}

export async function deleteJobStep(formData: FormData) {
  const user = await getCurrentUser();

  if (!isHr(user)) {
    throw new Error("Unauthorized");
  }

  const stepId = formData.get("stepId") as string;
  const jobPostingId = formData.get("jobPostingId") as string;

  if (!stepId) return;

  await db.jobPostingStep.delete({ where: { id: stepId } });

  revalidatePath(`/jobs/${jobPostingId}/steps`);
}

export type AvailableSlotsResult = { slots: string[]; error?: string };

// Callable directly from client components (not just as a <form action>).
export async function getAvailableInterviewSlots(stepId: string, dateStr: string): Promise<AvailableSlotsResult> {
  const step = await db.jobPostingStep.findUnique({ where: { id: stepId } });

  if (!step || step.type !== "INTERVIEW" || !step.interviewerId || !step.dailyStartTime || !step.dailyEndTime) {
    return { slots: [], error: "This interview step is not configured correctly." };
  }

  const date = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { slots: [] };
  }

  if (step.availabilityStart && date < step.availabilityStart) return { slots: [] };
  if (step.availabilityEnd && date > step.availabilityEnd) return { slots: [] };

  const allSlots = generateDaySlots(step.dailyStartTime, step.dailyEndTime);

  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59`);

  const bookings = await db.jobApplicationStepResponse.findMany({
    where: {
      interviewerId: step.interviewerId,
      scheduledAt: { gte: dayStart, lte: dayEnd }
    },
    select: { scheduledAt: true }
  });

  const bookedTimes = new Set(
    bookings
      .filter((b) => b.scheduledAt)
      .map((b) => {
        const d = b.scheduledAt as Date;
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      })
  );

  return { slots: allSlots.filter((slot) => !bookedTimes.has(slot)) };
}