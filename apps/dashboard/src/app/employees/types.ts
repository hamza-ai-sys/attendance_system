export type EmployeeRecord = {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string | null;
  roleName: string;
  managerName: string;
  timezone: string;
  status: string;
};

export type EmployeeRoleOption = {
  id: string;
  name: string;
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
  roleId: string;
  supervisorId: string;
  shiftInTime: string;
  shiftOutTime: string;
  timezone: string;
};
