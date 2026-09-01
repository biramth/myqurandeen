import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import {
  authors,
  quranReciters,
  quranSurahs,
  quranVerseAudio,
  quranVerses,
  translations,
  verseTranslations,
} from "../../database/schema";

@Injectable()
export class QuranService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listSurahs() {
    return this.db.select().from(quranSurahs).orderBy(asc(quranSurahs.number));
  }

  async getSurahByNumber(number: number) {
    const surah = await this.db.query.quranSurahs.findFirst({ where: eq(quranSurahs.number, number) });
    if (!surah) {
      throw new NotFoundException(`Sourate ${number} introuvable`);
    }

    const verses = await this.db
      .select({
        id: quranVerses.id,
        numberInSurah: quranVerses.numberInSurah,
        textArabic: quranVerses.textArabic,
        textTransliterated: quranVerses.textTransliterated,
      })
      .from(quranVerses)
      .where(eq(quranVerses.surahId, surah.id))
      .orderBy(asc(quranVerses.numberInSurah));

    return { ...surah, verses };
  }

  async getVerse(surahNumber: number, verseNumber: number) {
    const surah = await this.db.query.quranSurahs.findFirst({ where: eq(quranSurahs.number, surahNumber) });
    if (!surah) {
      throw new NotFoundException(`Sourate ${surahNumber} introuvable`);
    }

    const verse = await this.db.query.quranVerses.findFirst({
      where: and(eq(quranVerses.surahId, surah.id), eq(quranVerses.numberInSurah, verseNumber)),
    });
    if (!verse) {
      throw new NotFoundException(`Verset ${surahNumber}:${verseNumber} introuvable`);
    }

    const verseTranslationsRows = await this.db
      .select({
        translationId: translations.id,
        translationName: translations.name,
        language: translations.language,
        translatorName: authors.name,
        text: verseTranslations.text,
      })
      .from(verseTranslations)
      .innerJoin(translations, eq(translations.id, verseTranslations.translationId))
      .leftJoin(authors, eq(authors.id, translations.translatorAuthorId))
      .where(eq(verseTranslations.verseId, verse.id));

    return {
      surah: { number: surah.number, nameArabic: surah.nameArabic, nameTransliterated: surah.nameTransliterated },
      verse,
      translations: verseTranslationsRows,
    };
  }

  async getSurahTranslation(surahNumber: number, translationId: string) {
    const surah = await this.db.query.quranSurahs.findFirst({ where: eq(quranSurahs.number, surahNumber) });
    if (!surah) {
      throw new NotFoundException(`Sourate ${surahNumber} introuvable`);
    }

    const rows = await this.db
      .select({ numberInSurah: quranVerses.numberInSurah, text: verseTranslations.text })
      .from(verseTranslations)
      .innerJoin(quranVerses, eq(quranVerses.id, verseTranslations.verseId))
      .where(and(eq(quranVerses.surahId, surah.id), eq(verseTranslations.translationId, translationId)))
      .orderBy(asc(quranVerses.numberInSurah));

    return rows;
  }

  async listTranslations() {
    // Ne renvoie que les editions reellement associees a des versets (la table
    // `translations` est partagee avec les traductions de hadiths).
    return this.db
      .select({
        id: translations.id,
        name: translations.name,
        language: translations.language,
        translatorName: authors.name,
      })
      .from(translations)
      .innerJoin(verseTranslations, eq(verseTranslations.translationId, translations.id))
      .leftJoin(authors, eq(authors.id, translations.translatorAuthorId))
      .groupBy(translations.id, translations.name, translations.language, authors.name)
      .orderBy(asc(translations.language));
  }

  async listReciters() {
    return this.db
      .select({
        id: quranReciters.id,
        slug: quranReciters.slug,
        nameArabic: quranReciters.nameArabic,
        nameTransliterated: quranReciters.nameTransliterated,
        style: quranReciters.style,
        bitrate: quranReciters.bitrate,
      })
      .from(quranReciters)
      .orderBy(asc(quranReciters.slug));
  }

  async getVerseAudio(surahNumber: number, verseNumber: number) {
    const surah = await this.db.query.quranSurahs.findFirst({ where: eq(quranSurahs.number, surahNumber) });
    if (!surah) {
      throw new NotFoundException(`Sourate ${surahNumber} introuvable`);
    }

    const verse = await this.db.query.quranVerses.findFirst({
      where: and(eq(quranVerses.surahId, surah.id), eq(quranVerses.numberInSurah, verseNumber)),
    });
    if (!verse) {
      throw new NotFoundException(`Verset ${surahNumber}:${verseNumber} introuvable`);
    }

    const items = await this.db
      .select({
        reciterId: quranReciters.id,
        slug: quranReciters.slug,
        nameArabic: quranReciters.nameArabic,
        nameTransliterated: quranReciters.nameTransliterated,
        style: quranReciters.style,
        bitrate: quranReciters.bitrate,
        url: quranVerseAudio.url,
        durationSec: quranVerseAudio.durationSec,
      })
      .from(quranVerseAudio)
      .innerJoin(quranReciters, eq(quranReciters.id, quranVerseAudio.reciterId))
      .where(eq(quranVerseAudio.verseId, verse.id))
      .orderBy(asc(quranReciters.slug));

    return { items };
  }
}
