export type ReportStatus = "SIGNALE" | "EN_REVUE" | "CORRECTION" | "VALIDATION" | "PUBLIE";

export const REPORT_STATUSES: ReportStatus[] = ["SIGNALE", "EN_REVUE", "CORRECTION", "VALIDATION", "PUBLIE"];

export interface AdminReport {
  id: string;
  reporterUserId: string | null;
  reporterName: string | null;
  targetType: string;
  targetId: string;
  reasonCategory: string;
  description: string | null;
  status: ReportStatus;
  assignedTo: string | null;
  assigneeName: string | null;
  createdAt: string;
}

export interface ReportHistoryEntry {
  id: string;
  status: ReportStatus;
  note: string | null;
  changedBy: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  roleId: string;
  roleName: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
}

export type FiqhSuggestionStatus = "NOUVELLE" | "EN_COURS" | "TRAITEE";

export const FIQH_SUGGESTION_STATUSES: FiqhSuggestionStatus[] = ["NOUVELLE", "EN_COURS", "TRAITEE"];

export interface AdminFiqhSuggestion {
  id: string;
  submittedBy: string | null;
  submittedByName: string | null;
  question: string;
  context: string | null;
  status: FiqhSuggestionStatus;
  adminNote: string | null;
  handledBy: string | null;
  handledByName: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  createdAt: string;
}
