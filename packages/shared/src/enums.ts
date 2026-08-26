/**
 * Enums partages entre l'API et le frontend. Rester en phase avec le
 * schema de base de donnees (apps/api/src/database/schema).
 */

export const ROLE_NAMES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "REVIEWER",
  "MODERATOR",
  "USER",
] as const;
export type RoleName = (typeof ROLE_NAMES)[number];

export const REVELATION_PLACES = ["mecca", "medina", "uncertain"] as const;
export type RevelationPlace = (typeof REVELATION_PLACES)[number];

export const SOURCE_TYPES = [
  "book",
  "website",
  "manuscript",
  "oral",
  "other",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const SCHOOL_TYPES = ["fiqh", "theological"] as const;
export type SchoolType = (typeof SCHOOL_TYPES)[number];

export const LEARNING_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type LearningLevel = (typeof LEARNING_LEVELS)[number];

/** Cible polymorphe legere pour notes/favoris/collections/signalements. */
export const TARGET_TYPES = [
  "verse",
  "hadith",
  "tafsir_entry",
  "concept",
  "book",
  "scholar",
  "event",
  "fiqh_topic",
  "lesson",
] as const;
export type TargetType = (typeof TARGET_TYPES)[number];

export const REPORT_REASONS = [
  "error",
  "wrong_reference",
  "wrong_attribution",
  "translation_issue",
  "incomplete_content",
  "technical_issue",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = [
  "SIGNALE",
  "EN_REVUE",
  "CORRECTION",
  "VALIDATION",
  "PUBLIE",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
