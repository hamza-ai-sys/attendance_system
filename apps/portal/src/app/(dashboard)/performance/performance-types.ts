import type { FieldDefinition } from "./actions";

export interface TemplateData {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  fields: FieldDefinition[];
  createdAt: string;
  creatorName: string;
  evaluationCount: number;
}

export interface EvaluationData {
  id: string;
  templateTitle: string;
  employeeName: string;
  employeeEmail: string;
  evaluatorName: string;
  evaluatorRole: string;
  overallScore: number | null;
  comments: string | null;
  submittedAt: string;
  responses: Record<string, string | number>;
  fields: FieldDefinition[];
}
