import { apiClient } from "@/lib/api-client";

export interface NotificationsHealth {
  ready: boolean;
  vapidPublicKey: string | null;
  lastTickAt: string | null;
}

export interface TestDevice {
  host: string;
  userAgent: string | null;
  result: "sent" | "gone" | "error";
  sentAt: string | null;
}

export interface TestResult {
  sent: number;
  total: number;
  devices: TestDevice[];
}

export const notificationsApi = {
  health: () => apiClient.get<NotificationsHealth>("/notifications/health", { skipAuth: true }),
  isSubscribed: () => apiClient.get<{ subscribed: boolean }>("/notifications/subscribed"),
  subscribe: (input: { endpoint: string; p256dh: string; auth: string; userAgent?: string; timezone?: string }) =>
    apiClient.post<{ subscribed: boolean }>("/notifications/subscribe", input),
  unsubscribe: (endpoint: string) =>
    apiClient.delete<{ subscribed: boolean }>(`/notifications/subscribe?endpoint=${encodeURIComponent(endpoint)}`),
  unsubscribeAll: () => apiClient.delete<{ subscribed: boolean }>("/notifications/subscriptions"),
  test: () => apiClient.post<TestResult>("/notifications/test"),
};
