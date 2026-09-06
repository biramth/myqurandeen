import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq, sql } from "drizzle-orm";
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

// Version du format d'export hors-ligne. A incremente quand le contenu ou la
// forme de l'export change (ex. nouvelle traduction, colonne ajoutee) pour
// forcer le client a retelecharger son cache hors-ligne.
export const QURAN_EXPORT_VERSION = "1";

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

  /**
   * Metadonnees audio d'une sourate entiere pour un recitateur donne, en une
   * seule requete (pas 1 par verset) - sert au telechargement hors-ligne de
   * l'audio (voir useOfflineAudioDownload.ts cote client), meme logique que
   * exportBulk/exportTranslation pour le texte. `downloadUrl` (relatif, meme
   * origine que le reste de l'API) plutot que l'URL CDN directe : le CDN
   * (cdn.islamic.network) n'envoie pas d'en-tete CORS, un `fetch()` cote
   * navigateur pour stocker le Blob en IndexedDB echoue donc si on lui passe
   * l'URL brute (le lecteur `<audio src>` en streaming, lui, n'a pas ce
   * probleme - CORS ne s'applique qu'aux lectures via `fetch`/XHR). Voir
   * QuranAudioProxyController pour le proxy correspondant.
   */
  async getSurahAudio(surahNumber: number, reciterSlug: string) {
    const surah = await this.db.query.quranSurahs.findFirst({ where: eq(quranSurahs.number, surahNumber) });
    if (!surah) {
      throw new NotFoundException(`Sourate ${surahNumber} introuvable`);
    }

    const reciter = await this.db.query.quranReciters.findFirst({ where: eq(quranReciters.slug, reciterSlug) });
    if (!reciter) {
      throw new NotFoundException(`Recitateur ${reciterSlug} introuvable`);
    }

    const rows = await this.db
      .select({
        numberInSurah: quranVerses.numberInSurah,
        durationSec: quranVerseAudio.durationSec,
      })
      .from(quranVerseAudio)
      .innerJoin(quranVerses, eq(quranVerses.id, quranVerseAudio.verseId))
      .where(and(eq(quranVerses.surahId, surah.id), eq(quranVerseAudio.reciterId, reciter.id)))
      .orderBy(asc(quranVerses.numberInSurah));

    const items = rows.map((row) => ({
      numberInSurah: row.numberInSurah,
      durationSec: row.durationSec,
      downloadUrl: `/quran/surahs/${surahNumber}/verses/${row.numberInSurah}/audio/${reciterSlug}/download`,
    }));

    return { items };
  }

  /** URL CDN brute d'un verset - reservee au proxy de telechargement (jamais exposee telle quelle au client pour le hors-ligne, voir getSurahAudio). */
  async getVerseAudioUrl(surahNumber: number, verseNumber: number, reciterSlug: string): Promise<string> {
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
    const reciter = await this.db.query.quranReciters.findFirst({ where: eq(quranReciters.slug, reciterSlug) });
    if (!reciter) {
      throw new NotFoundException(`Recitateur ${reciterSlug} introuvable`);
    }
    const row = await this.db.query.quranVerseAudio.findFirst({
      where: and(eq(quranVerseAudio.verseId, verse.id), eq(quranVerseAudio.reciterId, reciter.id)),
    });
    if (!row) {
      throw new NotFoundException(`Audio introuvable pour ${surahNumber}:${verseNumber} (${reciterSlug})`);
    }
    return row.url;
  }

  async exportBulk() {
    const surahs = await this.db
      .select({
        id: quranSurahs.id,
        number: quranSurahs.number,
        nameArabic: quranSurahs.nameArabic,
        nameTransliterated: quranSurahs.nameTransliterated,
        nameTranslated: quranSurahs.nameTranslated,
        versesCount: quranSurahs.versesCount,
        revelationPlace: quranSurahs.revelationPlace,
        generalInfo: quranSurahs.generalInfo,
        themes: quranSurahs.themes,
      })
      .from(quranSurahs)
      .orderBy(asc(quranSurahs.number));

    const verses = await this.db
      .select({
        surahNumber: quranSurahs.number,
        numberInSurah: quranVerses.numberInSurah,
        textArabic: quranVerses.textArabic,
        textTransliterated: quranVerses.textTransliterated,
      })
      .from(quranVerses)
      .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId))
      .orderBy(asc(quranSurahs.number), asc(quranVerses.numberInSurah));

    return { version: QURAN_EXPORT_VERSION, surahs, verses };
  }

  async exportTranslation(translationId: string) {
    const translation = await this.db.query.translations.findFirst({ where: eq(translations.id, translationId) });
    if (!translation) {
      throw new NotFoundException(`Traduction ${translationId} introuvable`);
    }

    const items = await this.db
      .select({
        surahNumber: quranSurahs.number,
        numberInSurah: quranVerses.numberInSurah,
        text: verseTranslations.text,
      })
      .from(verseTranslations)
      .innerJoin(quranVerses, eq(quranVerses.id, verseTranslations.verseId))
      .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId))
      .where(eq(verseTranslations.translationId, translationId))
      .orderBy(asc(quranSurahs.number), asc(quranVerses.numberInSurah));

    return { version: QURAN_EXPORT_VERSION, items };
  }

  getExportVersion() {
    return { version: QURAN_EXPORT_VERSION };
  }

  /**
   * Estimation en octets du volume a telecharger pour le cache hors-ligne :
   * texte coranique + chaque traduction. Sert a afficher une taille avant de
   * demander confirmation (connexions limitees / data mobile).
   */
  async getOfflineSizes() {
    const [quran] = await this.db
      .select({
        bytes: sql`coalesce(sum(octet_length(${quranVerses.textArabic}) + octet_length(coalesce(${quranVerses.textTransliterated}, ''))), 0)::int`,
      })
      .from(quranVerses);

    const translationRows = await this.db
      .select({
        translationId: translations.id,
        bytes: sql`coalesce(sum(octet_length(${verseTranslations.text})), 0)::int`,
      })
      .from(verseTranslations)
      .innerJoin(translations, eq(translations.id, verseTranslations.translationId))
      .groupBy(translations.id);

    const translationsSizes: Record<string, number> = {};
    for (const row of translationRows) {
      translationsSizes[row.translationId] = Number(row.bytes);
    }

    return {
      version: QURAN_EXPORT_VERSION,
      quranBytes: Number(quran?.bytes ?? 0),
      translationsBytes: translationsSizes,
    };
  }
}
