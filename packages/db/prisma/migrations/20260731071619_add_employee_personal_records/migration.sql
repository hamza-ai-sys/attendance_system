-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "currentAddress" TEXT,
ADD COLUMN     "dateOfBirth" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "permanentAddress" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "shiftInTime" TEXT DEFAULT '09:00',
ADD COLUMN     "shiftOutTime" TEXT DEFAULT '17:00';

-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "paidDays" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "unpaidDays" DOUBLE PRECISION DEFAULT 0;
