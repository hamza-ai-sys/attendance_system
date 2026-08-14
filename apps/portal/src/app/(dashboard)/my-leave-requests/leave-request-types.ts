export interface LeaveBalanceItem {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  isPaid: boolean;
  allocated: number;
  accrued: number;
  used: number;
  carriedOver: number;
  available: number;
}

export interface LeaveTypeOption {
  id: string;
  name: string;
  code: string;
  isPaid: boolean;
}

export interface LeaveRequestItem {
  id: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  startDateStr: string;
  endDateStr: string;
  totalDays: number;
  paidDays?: number | null;
  unpaidDays?: number | null;
  reason: string;
  status: "PENDING_MANAGER" | "PENDING_HR" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string | null;
  createdAtStr: string;
}

export type LeaveStatusFilter = "all" | "pending" | "approved" | "cancelled";
