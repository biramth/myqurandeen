import { apiClient } from "@/lib/api-client";

export interface NotificationsHealth {
  ready: boolean;
  vapidPublicKey: string | null;
  lastTickAt: string | null;
}

export const notificationsApi = {
  health: () => apiClient.get<NotificationsHealth>("/notifications/health", { skipAuth: true }),
  isSubscribed: () => apiClient.get<{ subscribed: boolean }>("/notifications/subscribed"),
  subscribe: (input: { endpoint: string; p256dh: string; auth: string; userAgent?: string }) =>
    apiClient.post<{ subscribed: boolean }>("/notifications/subscribe", input),
  unsubscribe: (endpoint: string) =>
    apiClient.delete<{ subscribed: boolean }>(`/notifications/subscribe?endpoint=${encodeURIComponent(endpoint)}`),
  test: () => apiClient.post<{ sent: number; total: number }>("/notifications/test"),
};
