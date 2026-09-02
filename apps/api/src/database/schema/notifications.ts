import { boolean, index, pgTable, smallint, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";
import { REMINDER_TARGET_TYPES } from "@qurandeen/shared";

/**
 * Abonnement Web Push d'un navigateur (endpoint + cles chiffrement,
 * fournis par `PushManager.subscribe()` cote client). Un utilisateur peut
 * avoir plusieurs abonnements (plusieurs appareils/navigateurs) ; supprime
 * automatiquement par le planificateur si l'envoi echoue en 404/410 (le
 * navigateur a revoque l'abonnement).
 */
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  ...timestamps,
}).enableRLS();

/**
 * Rappel recurrent choisi par l'utilisateur : "fais cette dua" ou "lis cette
 * sourate" a une heure et des jours donnes. `label` fige le nom du contenu
 * au moment de la creation (evite un join a chaque tick du planificateur, et
 * reste correct meme si le contenu vise est renomme/supprime plus tard).
 */
export const reminders = pgTable(
  "reminders",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: varchar("target_type", { length: 20, enum: REMINDER_TARGET_TYPES }).notNull(),
    targetId: uuid("target_id"),
    /** Numero de sourate (1-114) quand targetType = "surah" ; NULL sinon. */
    surahNumber: smallint("surah_number"),
    label: varchar("label", { length: 250 }).notNull(),
    href: text("href").notNull(),
    timeOfDay: varchar("time_of_day", { length: 5 }).notNull(),
    /** Sous-ensemble de [0..6] (0 = dimanche), au moins un jour. */
    daysOfWeek: smallint("days_of_week").array().notNull(),
    /** Identifiant IANA (ex. "Europe/Paris"), capture cote client. */
    timezone: varchar("timezone", { length: 60 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("reminders_user_id_idx").on(t.userId),
    // Le planificateur (@Cron EVERY_MINUTE) filtre sur isActive a chaque tick.
    index("reminders_is_active_idx").on(t.isActive),
  ],
).enableRLS();

/**
 * Reglage unique par utilisateur pour la rotation automatique de sourates
 * ("rappelle-moi de lire une sourate differente chaque jour") - distinct de
 * `reminders` car il n'y a qu'une seule ligne par utilisateur et la cible
 * change a chaque envoi plutot que d'etre fixee a la creation.
 */
export const readingRotationSettings = pgTable("reading_rotation_settings", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  timeOfDay: varchar("time_of_day", { length: 5 }).notNull(),
  daysOfWeek: smallint("days_of_week").array().notNull(),
  timezone: varchar("timezone", { length: 60 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  /** Dernier numero de sourate envoye : le prochain tick reprend juste apres (boucle a 114). */
  lastSurahNumber: smallint("last_surah_number"),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
  ...timestamps,
}).enableRLS();
