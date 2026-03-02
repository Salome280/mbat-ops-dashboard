import type { TaskSection } from "./tasks";

export type MeetingSection = Exclude<TaskSection, "Dashboard Summary">;

export interface MeetingMinute {
  id: string;
  section: MeetingSection;
  date: string;
  title: string;
  attendees?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
