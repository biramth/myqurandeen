import { apiClient } from "@/lib/api-client";
import type {
  CreateReminderInput,
  RamadanAlertSettings,
  Reminder,
  RotationSettings,
  StreakAlertSettings,
  UpsertRamadanAlertSettingsInput,
  UpsertRotationSettingsInput,
  UpsertStreakAlertSettingsInput,
} from "./types";

export const remindersApi = {
  list: () => apiClient.get<Reminder[]>("/reminders"),
  create: (input: CreateReminderInput) => apiClient.post<Reminder>("/reminders", input),
  update: (id: string, input: Partial<Pick<Reminder, "timeOfDay" | "daysOfWeek" | "timezone" | "isActive">>) =>
    apiClient.patch<Reminder>(`/reminders/${id}`, input),
  remove: (id: string) => apiClient.delete<{ deleted: boolean }>(`/reminders/${id}`),

  getRotationSettings: () => apiClient.get<RotationSettings | null>("/reminders/rotation-settings"),
  upsertRotationSettings: (input: UpsertRotationSettingsInput) =>
    apiClient.put<RotationSettings>("/reminders/rotation-settings", input),
  deleteRotationSettings: () => apiClient.delete<{ deleted: boolean }>("/reminders/rotation-settings"),

  getStreakAlertSettings: () => apiClient.get<StreakAlertSettings | null>("/reminders/streak-alert-settings"),
  upsertStreakAlertSettings: (input: UpsertStreakAlertSettingsInput) =>
    apiClient.put<StreakAlertSettings>("/reminders/streak-alert-settings", input),

  getRamadanAlertSettings: () => apiClient.get<RamadanAlertSettings | null>("/reminders/ramadan-alert-settings"),
  upsertRamadanAlertSettings: (input: UpsertRamadanAlertSettingsInput) =>
    apiClient.put<RamadanAlertSettings>("/reminders/ramadan-alert-settings", input),
};
