import { apiClient } from "@/lib/api-client";
import type { AdminReport, AdminRole, AdminUser, ReportHistoryEntry, ReportStatus } from "./types";

export const adminApi = {
  listReports: () => apiClient.get<AdminReport[]>("/admin/reports"),
  getReportHistory: (id: string) => apiClient.get<ReportHistoryEntry[]>(`/admin/reports/${id}/history`),
  assignReport: (id: string, moderatorId: string) =>
    apiClient.patch<AdminReport>(`/admin/reports/${id}/assign`, { moderatorId }),
  updateReportStatus: (id: string, status: ReportStatus, note?: string) =>
    apiClient.patch<AdminReport>(`/admin/reports/${id}/status`, { status, note }),

  listUsers: () => apiClient.get<AdminUser[]>("/admin/users"),
  listRoles: () => apiClient.get<AdminRole[]>("/admin/users/roles"),
  updateUserRole: (id: string, roleId: string) => apiClient.patch<AdminUser>(`/admin/users/${id}/role`, { roleId }),
  updateUserActive: (id: string, isActive: boolean) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/active`, { isActive }),
};
