import { integer, pgTable, smallint, text, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { quranVerses } from "./quran";

/**
 * Recitateurs disponibles pour la recitation audio du Coran. Chaque
 * recitateur correspond a une edition audio per-verset d'Al Quran Cloud
 * (open CDN Islamic Network), verifiee manuellement (URL par verset global
 * 1..6236) avant d'etre ajoutee a RECITERS dans le script d'import.
 */
export const quranReciters = pgTable("quran_reciters", {
  id: id(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameArabic: varchar("name_arabic", { length: 200 }).notNull(),
  nameTransliterated: varchar("name_transliterated", { length: 200 }).notNull(),
  style: varchar("style", { length: 32 }).notNull(),
  editionCode: varchar("edition_code", { length: 64 }).notNull(),
  bitrate: smallint("bitrate").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  license: text("license").notNull(),
  ...timestamps,
}).enableRLS();

/** URL de recitation pour un verset et un recitateur donne. */
export const quranVerseAudio = pgTable(
  "quran_verse_audio",
  {
    id: id(),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => quranVerses.id, { onDelete: "cascade" }),
    reciterId: uuid("reciter_id")
      .notNull()
      .references(() => quranReciters.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    durationSec: integer("duration_sec"),
    ...timestamps,
  },
  (t) => [unique("quran_verse_audio_verse_reciter_uidx").on(t.verseId, t.reciterId)],
).enableRLS();