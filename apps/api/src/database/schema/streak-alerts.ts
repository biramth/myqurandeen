import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";

/**
 * Alerte "garde ta serie" : une ligne par utilisateur. Si l'utilisateur a une
 * serie en cours et n'a encore rien lu aujourd'hui (dans SON fuseau horaire)
 * a l'heure choisie, le planificateur envoie une notification push de rappel
 * pour ne pas perdre la serie. `lastSentAt` evite un double envoi le meme
 * jour calendaire local.
 */
export const streakAlertSettings = pgTable("streak_alert_settings", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Heure "HH:MM" (24h) a partir de laquelle l'alerte est due. */
  timeOfDay: varchar("time_of_day", { length: 5 }).notNull(),
  /** Identifiant IANA (ex. "Europe/Paris"), capture cote client. */
  timezone: varchar("timezone", { length: 60 }).notNull(),
  isActive: boolean("is_active").notNull().default(false),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
  ...timestamps,
});