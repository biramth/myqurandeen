import type { PrayerCalculationMethod, PrayerName } from "./prayer-times";

export interface PrayerAlertSettings {
  id: string;
  latitude: number;
  longitude: number;
  timezone: string;
  calculationMethod: PrayerCalculationMethod;
  enabledPrayers: PrayerName[];
  isActive: boolean;
}

export interface UpsertPrayerAlertSettingsInput {
  latitude: number;
  longitude: number;
  timezone: string;
  calculationMethod: PrayerCalculationMethod;
  enabledPrayers: PrayerName[];
  isActive: boolean;
}
