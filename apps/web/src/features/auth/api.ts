import { apiClient } from "@/lib/api-client";
import type { AuthResponse, AuthUser } from "./types";

export const authApi = {
  register: (input: { email: string; password: string; displayName: string }) =>
    apiClient.post<AuthResponse>("/auth/register", input, { skipAuth: true }),
  login: (input: { email: string; password: string }) =>
    apiClient.post<AuthResponse>("/auth/login", input, { skipAuth: true }),
  refresh: () => apiClient.post<{ accessToken: string }>("/auth/refresh", undefined, { skipAuth: true }),
  logout: () => apiClient.post<void>("/auth/logout"),
  me: () => apiClient.get<AuthUser>("/auth/me"),
  verifyEmail: (token: string) =>
    apiClient.post<{ emailVerified: boolean }>("/auth/verify-email", { token }, { skipAuth: true }),
  resendVerification: (email: string) =>
    apiClient.post<{ sent: boolean }>("/auth/resend-verification", { email }, { skipAuth: true }),
  forgotPassword: (email: string) =>
    apiClient.post<{ sent: boolean }>("/auth/forgot-password", { email }, { skipAuth: true }),
  resetPassword: (token: string, password: string) =>
    apiClient.post<{ success: boolean }>("/auth/reset-password", { token, password }, { skipAuth: true }),
  googleConfig: () => apiClient.get<{ enabled: boolean; clientId?: string }>("/auth/google/config", { skipAuth: true }),
};