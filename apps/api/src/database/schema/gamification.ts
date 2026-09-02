import { integer, pgTable, smallint, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";

/**
 * Couche de gamification : XP + niveau par utilisateur, compteurs d'actions,
 * succès débloqués et objectif du jour. Les compteurs sont incrémentés côté
 * serveur (jamais écrits bruts par le client) via GamificationService.
 */

/** XP total et niveau (dérivé des seuils du service) - une ligne par utilisateur. */
export const userGamification = pgTable(
  "user_gamification",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    xp: integer("xp").notNull().default(0),
    level: smallint("level").notNull().default(1),
    ...timestamps,
  },
).enableRLS();

/** Compteurs cumulés des actions significatives - une ligne par utilisateur. */
export const userStats = pgTable("user_stats", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  versesRead: integer("verses_read").notNull().default(0),
  hadithsRead: integer("hadiths_read").notNull().default(0),
  duasRead: integer("duas_read").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  quizzesCompleted: integer("quizzes_completed").notNull().default(0),
  notesCreated: integer("notes_created").notNull().default(0),
  bookmarksAdded: integer("bookmarks_added").notNull().default(0),
  ...timestamps,
}).enableRLS();

/** Succès débloqué par un utilisateur (clé = identifiant du succès défini dans GamificationService). */
export const userAchievements = pgTable(
  "user_achievements",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 40 }).notNull(),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("user_achievements_user_key_unique").on(t.userId, t.key)],
).enableRLS();

/** Nombre d'actions par jour calendaire local (alimente l'objectif du jour). Une ligne par (utilisateur, date). */
export const userDailyActions = pgTable(
  "user_daily_actions",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Date calendaire YYYY-MM-DD dans le fuseau local de l'utilisateur (fournie par le client). */
    dateKey: varchar("date_key", { length: 10 }).notNull(),
    count: integer("count").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("user_daily_actions_user_date_unique").on(t.userId, t.dateKey)],
).enableRLS();