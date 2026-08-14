export interface TeamMemberSummary {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string | null;
  roleName: string;
}

export interface PerformanceTemplateField {
  id: string;
  label: string;
  type: "rating" | "text" | "number" | "select";
  options?: string[];
  required?: boolean;
}

export interface ActivePerformanceTemplate {
  id: string;
  title: string;
  description?: string | null;
  fields: PerformanceTemplateField[];
  startDate: string;
  endDate: string;
}
