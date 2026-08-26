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
};
