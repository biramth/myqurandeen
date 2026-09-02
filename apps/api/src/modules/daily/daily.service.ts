import { Inject, Injectable } from "@nestjs/common";
import { count, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { authors, hadithCollections, hadiths, quranSurahs, quranVerses, translations, verseTranslations } from "../../database/schema";

/**
 * Cle de date UTC stable ("AAAA-MM-JJ") : le verset/hadith du jour change au
 * meme moment pour tout le monde, quel que soit le fuseau horaire du
 * visiteur, plutot que de dependre de l'heure locale de chacun.
 */
function todayUtcKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Hachage simple et deterministe (pas cryptographique - inutile pour ce
 * besoin) d'une chaine vers un entier positif, utilise pour choisir un index
 * stable dans le contenu du jour.
 */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

@Injectable()
export class DailyService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /**
   * Verset du jour : selection deterministe par hachage de la date UTC
   * modulo le nombre total de versets, triee par `id` (stable d'un appel a
   * l'autre pour un jeu de donnees inchange, peu importe l'ordre reel -
   * seule la stabilite compte ici, pas un ordre "naturel" sourate/verset).
   */
  async getDailyVerse() {
    const [{ value: total }] = await this.db.select({ value: count() }).from(quranVerses);
    if (total === 0) return null;
    const index = hashString(`verse-${todayUtcKey()}`) % total;

    const [verse] = await this.db
      .select({
        id: quranVerses.id,
        numberInSurah: quranVerses.numberInSurah,
        textArabic: quranVerses.textArabic,
        textTransliterated: quranVerses.textTransliterated,
        surahNumber: quranSurahs.number,
        surahNameArabic: quranSurahs.nameArabic,
        surahNameTransliterated: quranSurahs.nameTransliterated,
      })
      .from(quranVerses)
      .innerJoin(quranSurahs, eq(quranSurahs.id, quranVerses.surahId))
      .orderBy(quranVerses.id)
      .limit(1)
      .offset(index);
    if (!verse) return null;

    const translationRows = await this.db
      .select({
        translationId: translations.id,
        language: translations.language,
        translatorName: authors.name,
        text: verseTranslations.text,
      })
      .from(verseTranslations)
      .innerJoin(translations, eq(translations.id, verseTranslations.translationId))
      .leftJoin(authors, eq(authors.id, translations.translatorAuthorId))
      .where(eq(verseTranslations.verseId, verse.id));

    // Traduction francaise si disponible, sinon anglaise, sinon la premiere trouvee.
    const translation =
      translationRows.find((row) => row.language === "fr") ??
      translationRows.find((row) => row.language === "en") ??
      translationRows[0] ??
      null;

    return { ...verse, translation };
  }

  /** Hadith du jour : meme principe de selection que le verset du jour. */
  async getDailyHadith() {
    const [{ value: total }] = await this.db.select({ value: count() }).from(hadiths);
    if (total === 0) return null;
    const index = hashString(`hadith-${todayUtcKey()}`) % total;

    const [hadith] = await this.db
      .select({
        id: hadiths.id,
        number: hadiths.number,
        numberInCollection: hadiths.numberInCollection,
        textArabic: hadiths.textArabic,
        textTranslation: hadiths.textTranslation,
        authenticityGrade: hadiths.authenticityGrade,
        collectionSlug: hadithCollections.slug,
        collectionName: hadithCollections.name,
      })
      .from(hadiths)
      .innerJoin(hadithCollections, eq(hadithCollections.id, hadiths.collectionId))
      .orderBy(hadiths.id)
      .limit(1)
      .offset(index);

    return hadith ?? null;
  }
}
