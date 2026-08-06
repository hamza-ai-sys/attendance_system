-- CreateEnum
CREATE TYPE "JobStepType" AS ENUM ('EMAIL_CV', 'QUESTIONNAIRE', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('ONLINE', 'PHYSICAL');

-- CreateTable
CREATE TABLE "JobPostingStep" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "type" "JobStepType" NOT NULL,
    "order" INTEGER NOT NULL,
    "config" JSONB,
    "interviewMode" "InterviewMode",
    "interviewerId" TEXT,
    "location" TEXT,
    "availabilityStart" TIMESTAMP(3),
    "availabilityEnd" TIMESTAMP(3),
    "dailyStartTime" TEXT,
    "dailyEndTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPostingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationStepResponse" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "type" "JobStepType" NOT NULL,
    "answer" JSONB,
    "interviewerId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplicationStepResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobPostingStep_jobPostingId_order_idx" ON "JobPostingStep"("jobPostingId", "order");

-- CreateIndex
CREATE INDEX "JobPostingStep_interviewerId_idx" ON "JobPostingStep"("interviewerId");

-- CreateIndex
CREATE INDEX "JobApplicationStepResponse_stepId_scheduledAt_idx" ON "JobApplicationStepResponse"("stepId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationStepResponse_applicationId_stepId_key" ON "JobApplicationStepResponse"("applicationId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationStepResponse_interviewerId_scheduledAt_key" ON "JobApplicationStepResponse"("interviewerId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "JobPostingStep" ADD CONSTRAINT "JobPostingStep_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPostingStep" ADD CONSTRAINT "JobPostingStep_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationStepResponse" ADD CONSTRAINT "JobApplicationStepResponse_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationStepResponse" ADD CONSTRAINT "JobApplicationStepResponse_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "JobPostingStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
