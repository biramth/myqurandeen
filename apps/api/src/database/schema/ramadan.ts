import { boolean, integer, pgTable, smallint, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";

/**
 * Suivi de khatm (lecture complete du Coran sur le mois de Ramadan) - une
 * seule ligne par utilisateur, reutilisee/reinitialisee a chaque nouveau
 * Ramadan (`hijriYear` compare a l'annee hijri courante cote service : un
 * ecart signale un nouveau cycle plutot qu'une reprise). `versesCompleted`
 * est calcule cote serveur a partir de `lastSurahNumber`/`lastVerseNumber`
 * (position marquee par l'utilisateur, meme geste que "reprendre ou j'en
 * etais", 1.2) - jamais saisi directement, pour rester coherent avec la
 * position affichee. L'objectif quotidien (versets restants / jours
 * restants du Ramadan) est calcule cote client, comme le reste du module
 * horaires de priere/calendrier hijri (aucune donnee serveur necessaire
 * pour ce calcul).
 */
export const khatmProgress = pgTable("khatm_progress", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Annee hijri du cycle de khatm en cours (voir features/ramadan/hijri-calendar.ts). */
  hijriYear: integer("hijri_year").notNull(),
  /** Derniere position marquee. */
  lastSurahNumber: smallint("last_surah_number").notNull(),
  lastVerseNumber: smallint("last_verse_number").notNull(),
  /** Position cumulee (1..6236) correspondant a lastSurahNumber/lastVerseNumber - evite de recalculer la somme des versesCount a chaque lecture. */
  versesCompleted: integer("verses_completed").notNull(),
  /** Renseigne quand versesCompleted atteint le total du Coran (6236). */
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps,
}).enableRLS();

/**
 * Notification quotidienne pendant le mois de Ramadan - meme structure que
 * `streak_alert_settings`, desactivable independamment des autres rappels
 * (voir ROADMAP.md, phase 4).
 */
export const ramadanAlertSettings = pgTable("ramadan_alert_settings", {
  id: id(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Heure "HH:MM" (24h) a laquelle envoyer le rappel quotidien. */
  timeOfDay: varchar("time_of_day", { length: 5 }).notNull(),
  /** Identifiant IANA (ex. "Europe/Paris"), capture cote client. */
  timezone: varchar("timezone", { length: 60 }).notNull(),
  isActive: boolean("is_active").notNull().default(false),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
  ...timestamps,
}).enableRLS();
