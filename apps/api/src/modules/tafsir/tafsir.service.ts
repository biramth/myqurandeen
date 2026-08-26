import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { authors, quranSurahs, quranVerses, tafsirEntries, tafsirSources } from "../../database/schema";

@Injectable()
export class TafsirService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listWorks() {
    return this.db
      .select({
        id: tafsirSources.id,
        title: tafsirSources.title,
        language: tafsirSources.language,
        era: authors.era,
        description: tafsirSources.description,
        authorName: authors.name,
      })
      .from(tafsirSources)
      .leftJoin(authors, eq(authors.id, tafsirSources.authorId))
      .orderBy(asc(tafsirSources.language), asc(tafsirSources.title));
  }

  async getSurahTafsir(surahNumber: number, tafsirSourceId: string) {
    const surah = await this.db.query.quranSurahs.findFirst({ where: eq(quranSurahs.number, surahNumber) });
    if (!surah) return [];

    return this.db
      .select({ numberInSurah: quranVerses.numberInSurah, content: tafsirEntries.content })
      .from(tafsirEntries)
      .innerJoin(quranVerses, eq(quranVerses.id, tafsirEntries.verseStartId))
      .where(and(eq(quranVerses.surahId, surah.id), eq(tafsirEntries.tafsirSourceId, tafsirSourceId)))
      .orderBy(asc(quranVerses.numberInSurah));
  }

  async getVerseTafsirs(surahNumber: number, verseNumber: number) {
    const surah = await this.db.query.quranSurahs.findFirst({ where: eq(quranSurahs.number, surahNumber) });
    if (!surah) return [];

    const verse = await this.db.query.quranVerses.findFirst({
      where: and(eq(quranVerses.surahId, surah.id), eq(quranVerses.numberInSurah, verseNumber)),
    });
    if (!verse) return [];

    return this.db
      .select({
        tafsirSourceId: tafsirSources.id,
        workTitle: tafsirSources.title,
        language: tafsirSources.language,
        authorName: authors.name,
        content: tafsirEntries.content,
      })
      .from(tafsirEntries)
      .innerJoin(tafsirSources, eq(tafsirSources.id, tafsirEntries.tafsirSourceId))
      .leftJoin(authors, eq(authors.id, tafsirSources.authorId))
      .where(eq(tafsirEntries.verseStartId, verse.id))
      .orderBy(asc(tafsirSources.language));
  }
}
