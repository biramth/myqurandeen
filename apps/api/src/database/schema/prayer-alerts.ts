import { boolean, doublePrecision, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";

/**
 * Notifications aux 5 heures de priere (Fajr/Dhuhr/Asr/Maghrib/Isha) -
 * distinct de `dua_schedule_settings` (duas du matin/soir, contenu Hisn
 * al-Muslim). Une seule ligne par utilisateur. `latitude`/`longitude`
 * capturees cote client (geolocalisation navigateur, arrondies a ~110m sur
 * le frontend avant envoi) ; `enabledPrayers` permet de ne s'abonner qu'a
 * certaines prieres (ex. seulement Fajr). Un `*SentAt` par priere evite un
 * double envoi le meme jour calendaire local, meme logique que
 * `dua_schedule_settings.morningSentAt`/`eveningSentAt`.
 */
export const prayerAlertSettings = pgTable("prayer_alert_settings", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Latitude (WGS84) capturee cote client. */
  latitude: doublePrecision("latitude").notNull(),
  /** Longitude (WGS84) capturee cote client. */
  longitude: doublePrecision("longitude").notNull(),
  /** Identifiant IANA (ex. "Europe/Paris"), capture cote client. */
  timezone: varchar("timezone", { length: 60 }).notNull(),
  /** Cle de PRAYER_CALCULATION_METHODS (apps/api/.../prayer-times.ts). */
  calculationMethod: varchar("calculation_method", { length: 30 }).notNull().default("MuslimWorldLeague"),
  /** Sous-ensemble de ["fajr","dhuhr","asr","maghrib","isha"]. */
  enabledPrayers: varchar("enabled_prayers", { length: 10 })
    .array()
    .notNull()
    .default(["fajr", "dhuhr", "asr", "maghrib", "isha"]),
  isActive: boolean("is_active").notNull().default(false),
  fajrSentAt: timestamp("fajr_sent_at", { withTimezone: true }),
  dhuhrSentAt: timestamp("dhuhr_sent_at", { withTimezone: true }),
  asrSentAt: timestamp("asr_sent_at", { withTimezone: true }),
  maghribSentAt: timestamp("maghrib_sent_at", { withTimezone: true }),
  ishaSentAt: timestamp("isha_sent_at", { withTimezone: true }),
  ...timestamps,
}).enableRLS();
