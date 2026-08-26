import type { TFunction } from "i18next";

/**
 * Nom traduit d'une sourate dans la langue active. Repose sur les clés
 * quran.surahNames.<numero> des fichiers de locale ; si la traduction n'est
 * pas encore disponible pour la langue active, on retombe sur la traduction
 * anglaise importee depuis la source (nameTranslated).
 */
export function translatedSurahName(t: TFunction, surahNumber: number, fallback: string | null): string {
  return t(`quran.surahNames.${surahNumber}`, { defaultValue: fallback ?? "" });
}
