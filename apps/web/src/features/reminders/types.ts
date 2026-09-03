import type { ReminderTargetType } from "@qurandeen/shared";

export interface Reminder {
  id: string;
  targetType: ReminderTargetType;
  targetId: string | null;
  surahNumber: number | null;
  label: string;
  href: string;
  timeOfDay: string;
  daysOfWeek: number[];
  timezone: string;
  isActive: boolean;
  lastSentAt: string | null;
}

export interface RotationSettings {
  id: string;
  timeOfDay: string;
  daysOfWeek: number[];
  timezone: string;
  isActive: boolean;
  lastSurahNumber: number | null;
  lastSentAt: string | null;
}

export interface CreateReminderInput {
  targetType: ReminderTargetType;
  targetId?: string;
  surahNumber?: number;
  timeOfDay: string;
  daysOfWeek: number[];
  timezone: string;
}

export interface UpsertRotationSettingsInput {
  timeOfDay: string;
  daysOfWeek: number[];
  timezone: string;
  isActive: boolean;
}

export interface StreakAlertSettings {
  id: string;
  timeOfDay: string;
  timezone: string;
  isActive: boolean;
  lastSentAt: string | null;
}

export interface UpsertStreakAlertSettingsInput {
  timeOfDay: string;
  timezone: string;
  isActive: boolean;
}

export interface RamadanAlertSettings {
  id: string;
  timeOfDay: string;
  timezone: string;
  isActive: boolean;
  lastSentAt: string | null;
}

export interface UpsertRamadanAlertSettingsInput {
  timeOfDay: string;
  timezone: string;
  isActive: boolean;
}
