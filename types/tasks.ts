export type TaskStatus = "Not Started" | "In Progress" | "Blocked" | "Completed";

export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export type TaskSection =
  | "Dashboard Summary"
  | "Marketing Communication"
  | "Merchandise"
  | "Finance and Legal"
  | "School Relationships"
  | "Sponsorship";

export interface CommonTask {
  id: string;
  section: Exclude<TaskSection, "Dashboard Summary">;
  title: string;
  description?: string;
  owner?: string;
  deadline?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SponsorshipPipelineStage =
  | "Identified"
  | "Contacted"
  | "Followed Up"
  | "Call Scheduled"
  | "Proposal Sent"
  | "Negotiating"
  | "Confirmed"
  | "Lost";

export interface SponsorshipTask extends CommonTask {
  section: "Sponsorship";
  pipelineStage: SponsorshipPipelineStage;
  dealValue: number;
  contactName: string;
  probability: number;
  expectedRevenue: number;
  company: string;
  lastContacted?: string | null;
  nextFollowUp?: string | null;
  source?: string;
  stageNotes?: string;
}

export type AnyTask = CommonTask | SponsorshipTask;
