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
