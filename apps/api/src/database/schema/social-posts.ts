import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";

/**
 * Journal des publications automatiques reseaux sociaux (verset/hadith du
 * jour, voir SocialPosterService) - une ligne par plateforme et par jour
 * calendaire UTC. Sert a la fois de garde-fou anti-doublon (une seule
 * publication par plateforme et par jour, meme si le planificateur est
 * declenche plusieurs fois dans la meme journee via le cron externe) et de
 * journal d'audit (quoi a ete publie, quand, a partir de quel contenu).
 */
export const socialPosts = pgTable(
  "social_posts",
  {
    id: id(),
    /** "twitter" | "facebook" - une plateforme de plus s'ajoute sans migration de schema. */
    platform: varchar("platform", { length: 20 }).notNull(),
    /** Cle de date UTC ("AAAA-MM-JJ"), meme convention que `todayUtcKey()` du module `daily`. */
    dateKey: varchar("date_key", { length: 10 }).notNull(),
    /** "verse" | "hadith". */
    contentType: varchar("content_type", { length: 10 }).notNull(),
    /** Reference tracable du contenu publie (ex. "verse:123", "hadith:456"), pour l'audit. */
    contentRef: varchar("content_ref", { length: 100 }).notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("social_posts_platform_date_unique").on(t.platform, t.dateKey)],
).enableRLS();
