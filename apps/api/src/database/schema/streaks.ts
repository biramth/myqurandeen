import { date, pgTable, smallint, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_columns";
import { users } from "./identity";

/**
 * Serie de jours consecutifs d'activite ("streak", affichee comme une
 * flamme cote client) - une ligne par utilisateur, mise a jour par
 * StreaksService.recordActivity() a chaque action significative (lecon
 * terminee, note creee, favori ajoute, contenu lu...), jamais directement
 * incrementable par le client pour eviter qu'elle ne soit triche.
 * `lastActiveDate` est une date calendaire (pas un timestamp) au format
 * YYYY-MM-DD, dans le fuseau horaire local envoye par le client - deux
 * activites le meme jour local ne comptent qu'une fois.
 */
export const userStreaks = pgTable("user_streaks", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: smallint("current_streak").notNull().default(0),
  longestStreak: smallint("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date", { mode: "string" }),
  ...timestamps,
}).enableRLS();
