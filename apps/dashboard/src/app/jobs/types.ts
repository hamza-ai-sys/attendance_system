export type JobPostingState = { error?: string; success?: string };
export type ApplicationState = { error?: string; success?: string };

export interface ApplyStep {
  id: string;
  type: string;
  config: unknown;
  interviewMode: string | null;
  location: string | null;
  availabilityStart: Date | null;
  availabilityEnd: Date | null;
  interviewer: { fullName: string } | null;
}
