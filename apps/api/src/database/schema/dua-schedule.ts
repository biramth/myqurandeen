import { boolean, doublePrecision, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";

/**
 * Planning automatique "dua du matin / dua du soir", active par defaut au
 * premier abonnement push (zero configuration cote utilisateur). Une seule
 * ligne par utilisateur. `morningSentAt`/`eveningSentAt` evite un double
 * envoi le meme jour calendaire local : meme logique que streak_alert_settings.
 *
 * Les horaires ne sont PAS configurables : le matin suit le Fajr et le soir
 * l'Isha, calcules (librairie adhan, methode Muslim World League) depuis la
 * position geographique de l'utilisateur. `latitude`/`longitude` viennent de
 * la geolocalisation navigateur au moment de l'abonnement push ; si elle a
 * ete refusee, le planificateur retombe sur les coordonnees de la ville
 * principale du fuseau horaire IANA (voir timezone-coordinates.ts).
 */
export const duaScheduleSettings = pgTable("dua_schedule_settings", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Identifiant IANA (ex. "Europe/Paris"), capture cote client. */
  timezone: varchar("timezone", { length: 60 }).notNull(),
  /** Latitude (WGS84) de l'utilisateur, capturee cote client (geoloc). */
  latitude: doublePrecision("latitude"),
  /** Longitude (WGS84) de l'utilisateur, capturee cote client (geoloc). */
  longitude: doublePrecision("longitude"),
  isActive: boolean("is_active").notNull().default(true),
  morningSentAt: timestamp("morning_sent_at", { withTimezone: true }),
  eveningSentAt: timestamp("evening_sent_at", { withTimezone: true }),
  ...timestamps,
}).enableRLS();