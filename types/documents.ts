import type { TaskSection } from "./tasks";

export type DocumentSection = Exclude<TaskSection, "Dashboard Summary">;

export type DocumentCategory =
  | "Contract"
  | "Invoice"
  | "Proposal"
  | "Deck"
  | "Other";

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "Contract",
  "Invoice",
  "Proposal",
  "Deck",
  "Other"
];

export interface DocumentItem {
  id: string;
  section: DocumentSection;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}
