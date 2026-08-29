import {
  customType,
  index,
  pgTable,
  smallint,
  text,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { id, timestamps } from "./_columns";
import { authors, sources } from "./sources";
import { users } from "./identity";
import { REVELATION_PLACES } from "@qurandeen/shared";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const quranSurahs = pgTable("quran_surahs", {
  id: id(),
  number: smallint("number").notNull().unique(),
  nameArabic: varchar("name_arabic", { length: 100 }).notNull(),
  nameTransliterated: varchar("name_transliterated", { length: 100 }).notNull(),
  nameTranslated: varchar("name_translated", { length: 100 }),
  versesCount: smallint("verses_count").notNull(),
  revelationPlace: varchar("revelation_place", { length: 16, enum: REVELATION_PLACES }),
  generalInfo: text("general_info"),
  themes: text("themes").array(),
  ...timestamps,
});

export const quranVerses = pgTable(
  "quran_verses",
  {
    id: id(),
    surahId: uuid("surah_id")
      .notNull()
      .references(() => quranSurahs.id, { onDelete: "cascade" }),
    numberInSurah: smallint("number_in_surah").notNull(),
    textArabic: text("text_arabic").notNull(),
    textTransliterated: text("text_transliterated"),
    textSearch: tsvector("text_search").generatedAlwaysAs(
      (): ReturnType<typeof sql> => sql`to_tsvector('simple', immutable_unaccent(coalesce(text_arabic, '')))`,
    ),
    ...timestamps,
  },
  (t) => [
    unique("quran_verses_surah_number_uidx").on(t.surahId, t.numberInSurah),
    index("quran_verses_text_search_gin_idx").using("gin", t.textSearch),
  ],
);

/** Une "edition" de traduction (ex. "Traduction Hamidullah, FR"). */
export const translations = pgTable("translations", {
  id: id(),
  name: varchar("name", { length: 200 }).notNull().unique(),
  language: varchar("language", { length: 8 }).notNull(),
  translatorAuthorId: uuid("translator_author_id").references(() => authors.id, {
    onDelete: "set null",
  }),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  ...timestamps,
});

export const verseTranslations = pgTable(
  "verse_translations",
  {
    id: id(),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => quranVerses.id, { onDelete: "cascade" }),
    translationId: uuid("translation_id")
      .notNull()
      .references(() => translations.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    textSearch: tsvector("text_search").generatedAlwaysAs(
      (): ReturnType<typeof sql> => sql`to_tsvector('simple', immutable_unaccent(coalesce("text", '')))`,
    ),
    ...timestamps,
  },
  (t) => [
    unique("verse_translations_verse_translation_uidx").on(t.verseId, t.translationId),
    index("verse_translations_text_search_gin_idx").using("gin", t.textSearch),
  ],
);

export const tafsirSources = pgTable("tafsir_sources", {
  id: id(),
  title: varchar("title", { length: 300 }).notNull().unique(),
  authorId: uuid("author_id").references(() => authors.id, { onDelete: "set null" }),
  era: varchar("era", { length: 100 }),
  language: varchar("language", { length: 8 }),
  description: text("description"),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  ...timestamps,
});

export const tafsirEntries = pgTable(
  "tafsir_entries",
  {
    id: id(),
    tafsirSourceId: uuid("tafsir_source_id")
      .notNull()
      .references(() => tafsirSources.id, { onDelete: "cascade" }),
    verseStartId: uuid("verse_start_id")
      .notNull()
      .references(() => quranVerses.id, { onDelete: "cascade" }),
    verseEndId: uuid("verse_end_id").references(() => quranVerses.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    textSearch: tsvector("text_search").generatedAlwaysAs(
      (): ReturnType<typeof sql> => sql`to_tsvector('simple', immutable_unaccent(coalesce(content, '')))`,
    ),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("tafsir_entries_text_search_gin_idx").using("gin", t.textSearch)],
);
