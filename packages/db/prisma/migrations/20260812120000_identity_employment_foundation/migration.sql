-- Identity, organization, employment, and authorization foundation.
-- Existing Employee ids are retained as Employment ids so operational history remains linked.

CREATE TYPE "UserAccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'LOCKED', 'DISABLED');
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'ENDED');
CREATE TYPE "EmploymentStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED', 'ENDED');
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'CONTRACT', 'PART_TIME', 'INTERN', 'CONSULTANT');
CREATE TYPE "AssignmentType" AS ENUM ('PRIMARY', 'SECONDARY', 'ACTING', 'TEMPORARY');
CREATE TYPE "OrganizationUnitType" AS ENUM ('COMPANY', 'DIVISION', 'DEPARTMENT', 'TEAM', 'BRANCH', 'COST_CENTER');
CREATE TYPE "ReportingLineType" AS ENUM ('PRIMARY', 'FUNCTIONAL', 'PROJECT');
CREATE TYPE "RoleAssignmentSource" AS ENUM ('SYSTEM', 'POSITION', 'MANUAL', 'TEMPORARY');
CREATE TYPE "PermissionScope" AS ENUM ('SELF', 'DIRECT_REPORTS', 'REPORTING_TREE', 'ORGANIZATION_UNIT', 'ORGANIZATION_UNIT_TREE', 'ORGANIZATION');

ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_createdById_fkey";
ALTER TABLE "ApprovalStep" DROP CONSTRAINT "ApprovalStep_approverEmployeeId_fkey";
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";
ALTER TABLE "EmployeeNote" DROP CONSTRAINT "EmployeeNote_authorId_fkey";
ALTER TABLE "EmployeeNote" DROP CONSTRAINT "EmployeeNote_employeeId_fkey";
ALTER TABLE "EmployeeShiftAssignment" DROP CONSTRAINT "EmployeeShiftAssignment_employeeId_fkey";
ALTER TABLE "EmployeeShiftAssignment" DROP CONSTRAINT "EmployeeShiftAssignment_shiftId_fkey";
ALTER TABLE "EnrollmentSession" DROP CONSTRAINT "EnrollmentSession_employeeId_fkey";
ALTER TABLE "EnrollmentSession" DROP CONSTRAINT "EnrollmentSession_requestedByEmployeeId_fkey";
ALTER TABLE "FingerprintEnrollment" DROP CONSTRAINT "FingerprintEnrollment_employeeId_fkey";
ALTER TABLE "JobPosting" DROP CONSTRAINT "JobPosting_createdById_fkey";
ALTER TABLE "JobPostingStep" DROP CONSTRAINT "JobPostingStep_interviewerId_fkey";
ALTER TABLE "LeaveApprovalStep" DROP CONSTRAINT "LeaveApprovalStep_approverEmployeeId_fkey";
ALTER TABLE "LeaveBalance" DROP CONSTRAINT "LeaveBalance_employeeId_fkey";
ALTER TABLE "LeaveRequest" DROP CONSTRAINT "LeaveRequest_employeeId_fkey";
ALTER TABLE "ManualAttendanceRequest" DROP CONSTRAINT "ManualAttendanceRequest_createdByEmployeeId_fkey";
ALTER TABLE "ManualAttendanceRequest" DROP CONSTRAINT "ManualAttendanceRequest_employeeId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_employeeId_fkey";
ALTER TABLE "PerformanceEvaluation" DROP CONSTRAINT "PerformanceEvaluation_employeeId_fkey";
ALTER TABLE "PerformanceEvaluation" DROP CONSTRAINT "PerformanceEvaluation_evaluatorId_fkey";
ALTER TABLE "PerformanceTemplate" DROP CONSTRAINT "PerformanceTemplate_createdById_fkey";
ALTER TABLE "ReportExport" DROP CONSTRAINT "ReportExport_requestedById_fkey";
ALTER TABLE "ScanEvent" DROP CONSTRAINT "ScanEvent_employeeId_fkey";

CREATE TABLE "Person" (
  "id" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "preferredName" TEXT,
  "personalEmail" TEXT,
  "phone" TEXT,
  "dateOfBirth" DATE,
  "gender" TEXT,
  "maritalStatus" TEXT,
  "currentAddress" TEXT,
  "permanentAddress" TEXT,
  "emergencyContactName" TEXT,
  "emergencyContactPhone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAccount" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "loginEmail" TEXT NOT NULL,
  "passwordHash" TEXT,
  "status" "UserAccountStatus" NOT NULL DEFAULT 'PENDING',
  "emailVerifiedAt" TIMESTAMP(3),
  "lastLoginAt" TIMESTAMP(3),
  "authVersion" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserSession" (
  "id" TEXT NOT NULL,
  "userAccountId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "authVersion" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationMembership" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
  "joinedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Employment" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "employeeCode" TEXT,
  "status" "EmploymentStatus" NOT NULL DEFAULT 'PENDING',
  "type" "EmploymentType" NOT NULL DEFAULT 'PERMANENT',
  "hiredAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "probationEnd" DATE,
  "endedAt" DATE,
  "attendanceEligible" BOOLEAN NOT NULL DEFAULT true,
  "leaveEligible" BOOLEAN NOT NULL DEFAULT true,
  "lastAnnouncementsViewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Employment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationUnit" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "parentId" TEXT,
  "code" TEXT,
  "name" TEXT NOT NULL,
  "type" "OrganizationUnitType" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationUnit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Position" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "code" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmploymentAssignment" (
  "id" TEXT NOT NULL,
  "employmentId" TEXT NOT NULL,
  "organizationUnitId" TEXT NOT NULL,
  "positionId" TEXT NOT NULL,
  "type" "AssignmentType" NOT NULL DEFAULT 'PRIMARY',
  "validFrom" DATE NOT NULL,
  "validUntil" DATE,
  "workLocation" TEXT,
  "timezone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmploymentAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReportingLine" (
  "id" TEXT NOT NULL,
  "subordinateEmploymentId" TEXT NOT NULL,
  "supervisorEmploymentId" TEXT NOT NULL,
  "type" "ReportingLineType" NOT NULL DEFAULT 'PRIMARY',
  "validFrom" DATE NOT NULL,
  "validUntil" DATE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReportingLine_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EmployeeShiftAssignment" RENAME TO "ShiftAssignment";
ALTER TABLE "ShiftAssignment" RENAME CONSTRAINT "EmployeeShiftAssignment_pkey" TO "ShiftAssignment_pkey";
ALTER INDEX "EmployeeShiftAssignment_employeeId_effectiveFrom_effectiveT_idx" RENAME TO "ShiftAssignment_employeeId_effectiveFrom_effectiveTo_idx";

CREATE TABLE "PositionRoleMapping" (
  "id" TEXT NOT NULL,
  "positionId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "scope" "PermissionScope" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PositionRoleMapping_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoleAssignment" (
  "id" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "scope" "PermissionScope" NOT NULL,
  "organizationUnitId" TEXT,
  "source" "RoleAssignmentSource" NOT NULL,
  "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil" TIMESTAMP(3),
  "grantedByUserAccountId" TEXT,
  "reason" TEXT,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoleAssignment_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Organization" ("id", "name", "slug", "timezone", "updatedAt")
VALUES ('default-organization', 'Attendance System Company', 'default', 'Asia/Karachi', CURRENT_TIMESTAMP);

INSERT INTO "OrganizationUnit" ("id", "organizationId", "code", "name", "type", "updatedAt") VALUES
  ('unit-executive', 'default-organization', 'EXEC', 'Executive', 'DEPARTMENT', CURRENT_TIMESTAMP),
  ('unit-hr', 'default-organization', 'HR', 'Human Resources', 'DEPARTMENT', CURRENT_TIMESTAMP),
  ('unit-engineering', 'default-organization', 'ENG', 'Engineering', 'DEPARTMENT', CURRENT_TIMESTAMP),
  ('unit-operations', 'default-organization', 'OPS', 'Operations', 'DEPARTMENT', CURRENT_TIMESTAMP);

INSERT INTO "Position" ("id", "organizationId", "code", "title", "updatedAt") VALUES
  ('position-owner', 'default-organization', 'OWNER', 'Owner', CURRENT_TIMESTAMP),
  ('position-hr', 'default-organization', 'HR_OFFICER', 'HR Officer', CURRENT_TIMESTAMP),
  ('position-manager', 'default-organization', 'MANAGER', 'Manager', CURRENT_TIMESTAMP),
  ('position-employee', 'default-organization', 'EMPLOYEE', 'Employee', CURRENT_TIMESTAMP);

INSERT INTO "Person" (
  "id", "legalName", "personalEmail", "phone", "dateOfBirth", "gender", "maritalStatus",
  "currentAddress", "permanentAddress", "emergencyContactName", "emergencyContactPhone",
  "createdAt", "updatedAt"
)
SELECT
  'person-' || "id", "fullName", "email", "phone",
  CASE WHEN "dateOfBirth" ~ '^\d{4}-\d{2}-\d{2}$' THEN "dateOfBirth"::date ELSE NULL END,
  "gender", "maritalStatus", "currentAddress", "permanentAddress",
  "emergencyContactName", "emergencyContactPhone", "createdAt", "updatedAt"
FROM "Employee";

INSERT INTO "UserAccount" (
  "id", "personId", "loginEmail", "passwordHash", "status", "createdAt", "updatedAt"
)
SELECT "id", 'person-' || "id", lower("email"), "passwordHash",
  CASE WHEN "status" = 'ACTIVE' THEN 'ACTIVE'::"UserAccountStatus" ELSE 'DISABLED'::"UserAccountStatus" END,
  "createdAt", "updatedAt"
FROM "Employee";

INSERT INTO "OrganizationMembership" (
  "id", "organizationId", "personId", "status", "joinedAt", "createdAt", "updatedAt"
)
SELECT 'membership-' || "id", 'default-organization', 'person-' || "id", 'ACTIVE', "createdAt", "createdAt", "updatedAt"
FROM "Employee";

INSERT INTO "Employment" (
  "id", "organizationId", "membershipId", "employeeCode", "status", "hiredAt",
  "lastAnnouncementsViewedAt", "createdAt", "updatedAt"
)
SELECT "id", 'default-organization', 'membership-' || "id", "employeeCode",
  "status"::text::"EmploymentStatus", "createdAt"::date, "lastAnnouncementsViewedAt", "createdAt", "updatedAt"
FROM "Employee";

DROP INDEX "Role_name_key";
ALTER TABLE "Role" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "Role" ADD COLUMN "key" TEXT;
ALTER TABLE "Role" ADD COLUMN "isSystem" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Role" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Role" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Role" SET "organizationId" = 'default-organization', "key" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '_', 'g')), "isSystem" = true;
ALTER TABLE "Role" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Role" ALTER COLUMN "key" SET NOT NULL;

DROP INDEX "Permission_name_key";
ALTER TABLE "Permission" ADD COLUMN "key" TEXT;
ALTER TABLE "Permission" ADD COLUMN "category" TEXT;
ALTER TABLE "Permission" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Permission" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Permission" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Permission" SET "key" = "name", "category" = split_part("name", '_', 1), "name" = initcap(replace("name", '_', ' '));
ALTER TABLE "Permission" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "Permission" ALTER COLUMN "category" SET NOT NULL;
ALTER TABLE "Permission" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Role" ALTER COLUMN "updatedAt" DROP DEFAULT;

INSERT INTO "PositionRoleMapping" ("id", "positionId", "roleId", "scope", "updatedAt")
SELECT 'position-role-' || r."id",
  CASE r."key" WHEN 'owner' THEN 'position-owner' WHEN 'hr' THEN 'position-hr' WHEN 'manager' THEN 'position-manager' ELSE 'position-employee' END,
  r."id",
  CASE r."key" WHEN 'owner' THEN 'ORGANIZATION'::"PermissionScope" WHEN 'hr' THEN 'ORGANIZATION'::"PermissionScope" WHEN 'manager' THEN 'ORGANIZATION_UNIT_TREE'::"PermissionScope" ELSE 'SELF'::"PermissionScope" END,
  CURRENT_TIMESTAMP
FROM "Role" r;

INSERT INTO "EmploymentAssignment" (
  "id", "employmentId", "organizationUnitId", "positionId", "validFrom", "timezone", "updatedAt"
)
SELECT 'assignment-' || e."id", e."id",
  CASE lower(coalesce(r."name", 'employee')) WHEN 'owner' THEN 'unit-executive' WHEN 'hr' THEN 'unit-hr' ELSE 'unit-engineering' END,
  CASE lower(coalesce(r."name", 'employee')) WHEN 'owner' THEN 'position-owner' WHEN 'hr' THEN 'position-hr' WHEN 'manager' THEN 'position-manager' ELSE 'position-employee' END,
  e."createdAt"::date, e."timezone", CURRENT_TIMESTAMP
FROM "Employee" e LEFT JOIN "Role" r ON r."id" = e."roleId";

INSERT INTO "ReportingLine" (
  "id", "subordinateEmploymentId", "supervisorEmploymentId", "validFrom", "updatedAt"
)
SELECT 'reporting-' || "id", "id", "managerId", "createdAt"::date, CURRENT_TIMESTAMP
FROM "Employee" WHERE "managerId" IS NOT NULL;

INSERT INTO "Shift" ("id", "name", "timezone", "startTime", "endTime", "workdays", "updatedAt")
SELECT 'legacy-shift-' || "id", "fullName" || ' default shift', "timezone",
  coalesce("shiftInTime", '09:00'), coalesce("shiftOutTime", '17:00'), ARRAY[1,2,3,4,5], CURRENT_TIMESTAMP
FROM "Employee" e
WHERE NOT EXISTS (SELECT 1 FROM "ShiftAssignment" a WHERE a."employeeId" = e."id");

INSERT INTO "ShiftAssignment" ("id", "employeeId", "shiftId", "effectiveFrom")
SELECT 'legacy-shift-assignment-' || "id", "id", 'legacy-shift-' || "id", "createdAt"
FROM "Employee" e
WHERE NOT EXISTS (SELECT 1 FROM "ShiftAssignment" a WHERE a."employeeId" = e."id");

ALTER TABLE "EnrollmentSession" RENAME COLUMN "requestedByEmployeeId" TO "requestedByUserAccountId";
ALTER TABLE "ManualAttendanceRequest" RENAME COLUMN "createdByEmployeeId" TO "createdByUserAccountId";
ALTER TABLE "Notification" RENAME COLUMN "employeeId" TO "userAccountId";
ALTER TABLE "ReportExport" RENAME COLUMN "requestedById" TO "requestedByUserAccountId";
ALTER INDEX "Notification_employeeId_status_createdAt_idx" RENAME TO "Notification_userAccountId_status_createdAt_idx";
ALTER INDEX "ReportExport_requestedById_createdAt_idx" RENAME TO "ReportExport_requestedByUserAccountId_createdAt_idx";

ALTER TABLE "Employee" DROP CONSTRAINT "Employee_managerId_fkey";
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_roleId_fkey";
DROP INDEX "Employee_managerId_idx";
DROP TABLE "Employee";
DROP TYPE "EmployeeStatus";

CREATE UNIQUE INDEX "UserAccount_personId_key" ON "UserAccount"("personId");
CREATE UNIQUE INDEX "UserAccount_loginEmail_key" ON "UserAccount"("loginEmail");
CREATE INDEX "UserAccount_status_idx" ON "UserAccount"("status");
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE INDEX "UserSession_userAccountId_expiresAt_idx" ON "UserSession"("userAccountId", "expiresAt");
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE INDEX "OrganizationMembership_personId_status_idx" ON "OrganizationMembership"("personId", "status");
CREATE INDEX "OrganizationMembership_organizationId_status_idx" ON "OrganizationMembership"("organizationId", "status");
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_personId_key" ON "OrganizationMembership"("organizationId", "personId");
CREATE UNIQUE INDEX "OrganizationMembership_id_organizationId_key" ON "OrganizationMembership"("id", "organizationId");
CREATE INDEX "Employment_membershipId_status_idx" ON "Employment"("membershipId", "status");
CREATE INDEX "Employment_organizationId_status_idx" ON "Employment"("organizationId", "status");
CREATE UNIQUE INDEX "Employment_organizationId_employeeCode_key" ON "Employment"("organizationId", "employeeCode");
CREATE INDEX "OrganizationUnit_organizationId_parentId_idx" ON "OrganizationUnit"("organizationId", "parentId");
CREATE UNIQUE INDEX "OrganizationUnit_organizationId_code_key" ON "OrganizationUnit"("organizationId", "code");
CREATE INDEX "Position_organizationId_isActive_idx" ON "Position"("organizationId", "isActive");
CREATE UNIQUE INDEX "Position_organizationId_code_key" ON "Position"("organizationId", "code");
CREATE INDEX "EmploymentAssignment_employmentId_validFrom_validUntil_idx" ON "EmploymentAssignment"("employmentId", "validFrom", "validUntil");
CREATE INDEX "EmploymentAssignment_organizationUnitId_validFrom_validUnti_idx" ON "EmploymentAssignment"("organizationUnitId", "validFrom", "validUntil");
CREATE INDEX "EmploymentAssignment_positionId_validFrom_validUntil_idx" ON "EmploymentAssignment"("positionId", "validFrom", "validUntil");
CREATE INDEX "ReportingLine_subordinateEmploymentId_validFrom_validUntil_idx" ON "ReportingLine"("subordinateEmploymentId", "validFrom", "validUntil");
CREATE INDEX "ReportingLine_supervisorEmploymentId_validFrom_validUntil_idx" ON "ReportingLine"("supervisorEmploymentId", "validFrom", "validUntil");
CREATE INDEX "PositionRoleMapping_roleId_idx" ON "PositionRoleMapping"("roleId");
CREATE UNIQUE INDEX "PositionRoleMapping_positionId_roleId_scope_key" ON "PositionRoleMapping"("positionId", "roleId", "scope");
CREATE INDEX "RoleAssignment_membershipId_validFrom_validUntil_idx" ON "RoleAssignment"("membershipId", "validFrom", "validUntil");
CREATE INDEX "RoleAssignment_roleId_idx" ON "RoleAssignment"("roleId");
CREATE INDEX "RoleAssignment_organizationUnitId_idx" ON "RoleAssignment"("organizationUnitId");
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");
CREATE INDEX "Role_organizationId_isActive_idx" ON "Role"("organizationId", "isActive");
CREATE UNIQUE INDEX "Role_organizationId_key_key" ON "Role"("organizationId", "key");
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_membershipId_organizationId_fkey" FOREIGN KEY ("membershipId", "organizationId") REFERENCES "OrganizationMembership"("id", "organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmploymentAssignment" ADD CONSTRAINT "EmploymentAssignment_employmentId_fkey" FOREIGN KEY ("employmentId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmploymentAssignment" ADD CONSTRAINT "EmploymentAssignment_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmploymentAssignment" ADD CONSTRAINT "EmploymentAssignment_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReportingLine" ADD CONSTRAINT "ReportingLine_subordinateEmploymentId_fkey" FOREIGN KEY ("subordinateEmploymentId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReportingLine" ADD CONSTRAINT "ReportingLine_supervisorEmploymentId_fkey" FOREIGN KEY ("supervisorEmploymentId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FingerprintEnrollment" ADD CONSTRAINT "FingerprintEnrollment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnrollmentSession" ADD CONSTRAINT "EnrollmentSession_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnrollmentSession" ADD CONSTRAINT "EnrollmentSession_requestedByUserAccountId_fkey" FOREIGN KEY ("requestedByUserAccountId") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ScanEvent" ADD CONSTRAINT "ScanEvent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ManualAttendanceRequest" ADD CONSTRAINT "ManualAttendanceRequest_createdByUserAccountId_fkey" FOREIGN KEY ("createdByUserAccountId") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManualAttendanceRequest" ADD CONSTRAINT "ManualAttendanceRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_approverEmployeeId_fkey" FOREIGN KEY ("approverEmployeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReportExport" ADD CONSTRAINT "ReportExport_requestedByUserAccountId_fkey" FOREIGN KEY ("requestedByUserAccountId") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Role" ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PositionRoleMapping" ADD CONSTRAINT "PositionRoleMapping_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PositionRoleMapping" ADD CONSTRAINT "PositionRoleMapping_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganizationMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_grantedByUserAccountId_fkey" FOREIGN KEY ("grantedByUserAccountId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobPostingStep" ADD CONSTRAINT "JobPostingStep_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveApprovalStep" ADD CONSTRAINT "LeaveApprovalStep_approverEmployeeId_fkey" FOREIGN KEY ("approverEmployeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeNote" ADD CONSTRAINT "EmployeeNote_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeNote" ADD CONSTRAINT "EmployeeNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PerformanceTemplate" ADD CONSTRAINT "PerformanceTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
