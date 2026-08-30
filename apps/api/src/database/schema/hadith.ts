import { customType, doublePrecision, index, integer, pgTable, primaryKey, text, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { id, timestamps } from "./_columns";
import { authors, sources } from "./sources";
import { users } from "./identity";
import { translations } from "./quran";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const hadithCollections = pgTable("hadith_collections", {
  id: id(),
  name: varchar("name", { length: 150 }).notNull(),
  nameArabic: varchar("name_arabic", { length: 150 }),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  compilerAuthorId: uuid("compiler_author_id").references(() => authors.id, { onDelete: "set null" }),
  description: text("description"),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  ...timestamps,
});

export const hadithBooks = pgTable(
  "hadith_books",
  {
    id: id(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => hadithCollections.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    ...timestamps,
  },
  (t) => [unique("hadith_books_collection_number_uidx").on(t.collectionId, t.number)],
);

export const hadiths = pgTable(
  "hadiths",
  {
    id: id(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => hadithCollections.id, { onDelete: "cascade" }),
    hadithBookId: uuid("hadith_book_id")
      .notNull()
      .references(() => hadithBooks.id, { onDelete: "cascade" }),
    // varchar (pas integer) : certaines collections numerotent des hadiths
    // "freres" (memes propos, chaines differentes) avec un suffixe decimal
    // (ex. "402.2" chez Bukhari) - identifiant fidele a la source, pas un nombre.
    number: varchar("number", { length: 20 }).notNull(),
    numberInCollection: varchar("number_in_collection", { length: 20 }).notNull(),
    /** Valeur numerique de numberInCollection, uniquement pour le tri (ex. 402.2). */
    sortOrder: doublePrecision("sort_order").notNull(),
    textArabic: text("text_arabic"),
    textTranslation: text("text_translation").notNull(),
    chainText: text("chain_text"),
    /** Resume court (ex. "Sahih") derive des classifications detaillees - voir hadith_grades pour le detail par savant. */
    authenticityGrade: varchar("authenticity_grade", { length: 60 }),
    authenticitySourceId: uuid("authenticity_source_id").references(() => sources.id, {
      onDelete: "set null",
    }),
    sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
    textSearch: tsvector("text_search").generatedAlwaysAs(
      (): ReturnType<typeof sql> =>
        sql`to_tsvector('simple', immutable_unaccent(coalesce(text_translation, '') || ' ' || coalesce(text_arabic, '')))`,
    ),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  // Pas de contrainte d'unicite sur (hadithBookId, number) : ce numero "dans le
  // livre" peut se repeter pour des hadiths freres (memes propos, chaines
  // differentes, ex. 25 et 25 bis) - identifiant d'affichage, pas une cle.
  (t) => [
    unique("hadiths_collection_number_uidx").on(t.collectionId, t.numberInCollection),
    index("hadiths_text_search_gin_idx").using("gin", t.textSearch),
    index("hadiths_hadith_book_id_idx").on(t.hadithBookId),
  ],
);

/**
 * Classification d'authenticite telle que rapportee, par savant/verificateur
 * (ex. Al-Albani, Ahmad Muhammad Shakir). Jamais une classification unique
 * inventee : chaque ligne est attribuee a sa source.
 */
export const hadithGrades = pgTable(
  "hadith_grades",
  {
    id: id(),
    hadithId: uuid("hadith_id")
      .notNull()
      .references(() => hadiths.id, { onDelete: "cascade" }),
    graderName: varchar("grader_name", { length: 150 }).notNull(),
    grade: varchar("grade", { length: 100 }).notNull(),
    ...timestamps,
  },
  (t) => [unique("hadith_grades_hadith_grader_uidx").on(t.hadithId, t.graderName)],
);

/**
 * Traductions alternatives d'un hadith (reutilise la table `translations`,
 * partagee avec le Coran, comme "edition" de traduction).
 */
export const hadithTranslations = pgTable(
  "hadith_translations",
  {
    id: id(),
    hadithId: uuid("hadith_id")
      .notNull()
      .references(() => hadiths.id, { onDelete: "cascade" }),
    translationId: uuid("translation_id")
      .notNull()
      .references(() => translations.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    ...timestamps,
  },
  (t) => [unique("hadith_translations_hadith_translation_uidx").on(t.hadithId, t.translationId)],
);

export const hadithTopics = pgTable("hadith_topics", {
  id: id(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  ...timestamps,
});

export const hadithTopicLinks = pgTable(
  "hadith_topic_links",
  {
    hadithId: uuid("hadith_id")
      .notNull()
      .references(() => hadiths.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => hadithTopics.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.hadithId, t.topicId] })],
);
