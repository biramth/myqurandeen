import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";

/**
 * Planning automatique "dua du matin / dua du soir", active par defaut au
 * premier abonnement push (zero configuration cote utilisateur). Une seule
 * ligne par utilisateur. `morningSentAt`/`eveningSentAt` evite un double
 * envoi le meme jour calendaire local : meme logique que streak_alert_settings.
 */
export const duaScheduleSettings = pgTable("dua_schedule_settings", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Identifiant IANA (ex. "Europe/Paris"), capture cote client. */
  timezone: varchar("timezone", { length: 60 }).notNull(),
  /** Heure "HH:MM" (24h) d'envoi du dua du matin. */
  morningTime: varchar("morning_time", { length: 5 }).notNull().default("07:00"),
  /** Heure "HH:MM" (24h) d'envoi du dua du soir. */
  eveningTime: varchar("evening_time", { length: 5 }).notNull().default("19:00"),
  isActive: boolean("is_active").notNull().default(true),
  morningSentAt: timestamp("morning_sent_at", { withTimezone: true }),
  eveningSentAt: timestamp("evening_sent_at", { withTimezone: true }),
  ...timestamps,
});