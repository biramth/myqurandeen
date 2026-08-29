import { pgTable, smallint, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { sources } from "./sources";
import { users } from "./identity";

/**
 * Invocations (dua) et rappels (dhikr) classes par theme (matin, soir,
 * après la prière, sommeil, repas, voyage, détresse...), compiles a partir
 * de Hisn al-Muslim ("La citadelle du musulman") de Sa'id ibn Ali ibn Wahf
 * Al-Qahtani, référence standard mondialement diffusee pour ce type de
 * contenu, elle-même fondee sur des hadiths authentiques (Sahih al-Bukhari,
 * Sahih Muslim et les Sunan). Chaque dua reste rattachee a cette source -
 * voir CONTRIBUTING.md (aucun contenu religieux invente).
 */
export const duaCategories = pgTable("dua_categories", {
  id: id(),
  name: varchar("name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  description: text("description"),
  orderIndex: smallint("order_index").notNull(),
  ...timestamps,
});

export const duas = pgTable("duas", {
  id: id(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => duaCategories.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 250 }).notNull(),
  /** Nullable : certaines entrees renvoient vers un passage coranique deja
   * present et source dans la section Coran (ex. "réciter Al-Ikhlas x3")
   * plutot que de dupliquer le texte arabe une seconde fois. */
  arabicText: text("arabic_text"),
  transliteration: text("transliteration"),
  translation: text("translation").notNull(),
  /** Nombre de fois a repeter (pour le compteur cote front) ; null = une seule fois / non precise. */
  repeatCount: smallint("repeat_count"),
  /** Merite/vertu de l'invocation, rapportee dans le hadith source, si mentionnee. */
  virtue: text("virtue"),
  /** Lien interne optionnel (ex. vers la sourate concernee dans /quran) pour les entrees de type "réciter X". */
  referenceUrl: text("reference_url"),
  orderIndex: smallint("order_index").notNull(),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
});
