import { apiClient } from "@/lib/api-client";
import type {
  CreateReminderInput,
  DuaScheduleSettings,
  Reminder,
  RotationSettings,
  StreakAlertSettings,
  UpsertDuaScheduleSettingsInput,
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

  getDuaScheduleSettings: () => apiClient.get<DuaScheduleSettings | null>("/reminders/dua-schedule-settings"),
  upsertDuaScheduleSettings: (input: UpsertDuaScheduleSettingsInput) =>
    apiClient.put<DuaScheduleSettings>("/reminders/dua-schedule-settings", input),
};
