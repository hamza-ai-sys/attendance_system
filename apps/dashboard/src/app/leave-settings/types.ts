export interface LeaveTypeItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  accrualFrequency: "MONTHLY" | "ANNUALLY";
  defaultAllocation: number;
  allowCarryForward: boolean;
  maxCarryForwardDays: number;
  isPaid: boolean;
  isActive: boolean;
}
