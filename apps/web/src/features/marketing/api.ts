import { apiClient } from "@/lib/api-client";

export interface SendAnnouncementResult {
  dryRun: boolean;
  test: boolean;
  sent: number;
  failed: number;
  eligible: number;
}

export interface MarketingRecipient {
  id: string;
  email: string;
  displayName: string;
  emailVerifiedAt: string | null;
  marketingOptOut: boolean;
  createdAt: string;
}

export interface MarketingGroupSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  memberCount: number;
}

export interface MarketingGroupDetail {
  group: MarketingGroupSummary;
  members: MarketingRecipient[];
}

export const marketingApi = {
  unsubscribe: (token: string) =>
    apiClient.post<{ email: string }>("/marketing/unsubscribe", { token }, { skipAuth: true }),

  /** Reserve a SUPER_ADMIN (permission marketing:send) - voir MarketingController. */
  sendAnnouncement: (options: { dryRun?: boolean; testEmail?: string; groupId?: string }) =>
    apiClient.post<SendAnnouncementResult>("/admin/marketing/announcement", options),

  listRecipients: (search?: string) =>
    apiClient.get<MarketingRecipient[]>(
      `/admin/marketing/recipients${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    ),

  listGroups: () => apiClient.get<MarketingGroupSummary[]>("/admin/marketing/groups"),

  getGroup: (groupId: string) => apiClient.get<MarketingGroupDetail>(`/admin/marketing/groups/${groupId}`),

  createGroup: (input: { name: string; description?: string }) =>
    apiClient.post<MarketingGroupSummary>("/admin/marketing/groups", input),

  deleteGroup: (groupId: string) => apiClient.delete<void>(`/admin/marketing/groups/${groupId}`),

  addGroupMembers: (groupId: string, userIds: string[]) =>
    apiClient.post<{ added: number }>(`/admin/marketing/groups/${groupId}/members`, { userIds }),

  removeGroupMember: (groupId: string, userId: string) =>
    apiClient.delete<void>(`/admin/marketing/groups/${groupId}/members/${userId}`),
};
