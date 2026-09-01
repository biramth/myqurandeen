import { apiClient } from "@/lib/api-client";
import type { PrayerAlertSettings, UpsertPrayerAlertSettingsInput } from "./types";

export const prayerAlertApi = {
  getSettings: () => apiClient.get<PrayerAlertSettings | null>("/reminders/prayer-alert-settings"),
  upsertSettings: (input: UpsertPrayerAlertSettingsInput) =>
    apiClient.put<PrayerAlertSettings>("/reminders/prayer-alert-settings", input),
};
