import type { AiSource } from "./types";

/**
 * Resout un lien navigable reel vers la fiche source d'un chunk RAG, quand
 * les metadonnees stockees le permettent. Ne devine jamais une URL : si les
 * metadonnees ne contiennent pas de quoi construire un lien fiable (par
 * exemple un slug), la source reste affichee comme simple citation, sans
 * lien casse.
 */
export function resolveSourceLink(source: AiSource): string | null {
  const m = source.metadata;

  switch (source.contentType) {
    case "verse":
    case "tafsir": {
      const surah = m.surahNumber;
      const verse = m.verseNumber;
      if (typeof surah === "number" && typeof verse === "number") {
        return `/quran/${surah}/${verse}`;
      }
      return null;
    }
    case "hadith": {
      const slug = m.collectionSlug;
      const number = m.numberInCollection;
      if (typeof slug === "string" && typeof number === "string") {
        return `/hadith/${slug}/${number}`;
      }
      return null;
    }
    default:
      return null;
  }
}
