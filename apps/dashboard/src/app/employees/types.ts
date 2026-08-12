export type EmployeeRecord = {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string | null;
  roleName: string;
  departmentName: string;
  positionTitle: string;
  managerName: string;
  timezone: string;
  status: string;
};

export type OrganizationUnitOption = {
  id: string;
  name: string;
};

export type PositionOption = {
  id: string;
  title: string;
};

export type EmployeeManagerOption = {
  id: string;
  fullName: string;
  email: string;
};

export type CreateEmployeeState = {
  error?: string;
  success?: string;
};

export type CreateEmployeeInput = {
  fullName: string;
  email: string;
  employeeCode: string;
  password: string;
  grantDashboardAccess: boolean;
  organizationUnitId: string;
  positionId: string;
  supervisorId: string;
  shiftInTime: string;
  shiftOutTime: string;
  timezone: string;
};
