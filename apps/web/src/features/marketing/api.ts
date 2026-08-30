import { apiClient } from "@/lib/api-client";

export interface SendAnnouncementResult {
  dryRun: boolean;
  test: boolean;
  sent: number;
  failed: number;
  eligible: number;
}

export const marketingApi = {
  unsubscribe: (token: string) =>
    apiClient.post<{ email: string }>("/marketing/unsubscribe", { token }, { skipAuth: true }),

  /** Reserve a SUPER_ADMIN (permission marketing:send) - voir MarketingController. */
  sendAnnouncement: (options: { dryRun?: boolean; testEmail?: string }) =>
    apiClient.post<SendAnnouncementResult>("/admin/marketing/announcement", options),
};
