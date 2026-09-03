import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { offlineDb, type OfflineSurah } from "@/database/offline-db";
import {
  getOfflineDownloadedTranslationIds,
  getOfflineSurahDetail,
  getOfflineSurahs,
  getOfflineSurahTranslation,
  getOfflineVerse,
  isOfflineQuranReady,
} from "@/features/quran/offline-quran";

/**
 * Test "mode avion" de bout en bout du cache hors-ligne du Coran.
 *
 * Rejoue le parcours utilisateur reel :
 *   1. ONLINE  : l'utilisateur telecharge le Coran (remplissage IndexedDB,
 *                meme forme que useOfflineDownload.download apres export).
 *   2. AVION    : plus de reseau. La lecture (liste des sourates, detail,
 *                verset, traduction, passage a la page suivante) doit se
 *                faire UNIQUEMENT depuis IndexedDB.
 *   3. MISE A JOUR : la version stockee sert a detecter un besoin de
 *                re-telechargement.
 *   4. NETTOYAGE : clearQuran vide completement le stock.
 *
 * Aucun client reseau n'est importe : la lecture est donc prouvee hors-ligne.
 */
describe("mode avion : lecture du Coran depuis IndexedDB", () => {
  beforeEach(async () => {
    await offlineDb.surahs.clear();
    await offlineDb.verses.clear();
    await offlineDb.translations.clear();
    await offlineDb.metadata.clear();
    await offlineDb.setQuranVersion("0");
  });

  // helper : remplit le stock comme le ferait un telechargement reussi,
  // avec 114 sourates (condition d'`isQuranDownloaded`) de taille reelle.
  const seedDownloadedQuran = async (translationIds: string[]) => {
    const surahs: OfflineSurah[] = Array.from({ length: 114 }, (_, i) => {
      const number = i + 1;
      return {
        id: `surah-${number}`,
        number,
        nameArabic: `سُورَة ${number}`,
        nameTransliterated: `Sourate ${number}`,
        nameTranslated: null,
        versesCount: number === 1 ? 7 : 4,
        revelationPlace: "mecca",
        generalInfo: `info-${number}`,
        themes: [`theme-${number}`],
      };
    });
    await offlineDb.surahs.bulkPut(surahs);

    const verses = surahs.flatMap((s) =>
      Array.from({ length: s.versesCount }, (_, j) => ({
        id: `${s.number}:${j + 1}`,
        surahNumber: s.number,
        numberInSurah: j + 1,
        textArabic: `آيَة ${s.number}:${j + 1}`,
        textTransliterated: `ayah ${s.number}:${j + 1}`,
      })),
    );
    await offlineDb.verses.bulkPut(verses);

    for (const translationId of translationIds) {
      const rows = surahs.flatMap((s) =>
        Array.from({ length: s.versesCount }, (_, j) => ({
          id: `${translationId}:${s.number}:${j + 1}`,
          surahNumber: s.number,
          numberInSurah: j + 1,
          translationId,
          text: `traduction ${s.number}:${j + 1}`,
        })),
      );
      await offlineDb.translations.bulkPut(rows);
    }

    await offlineDb.setDownloadedTranslations(translationIds);
    await offlineDb.setQuranVersion("1");
  };

  it("telecharge le Coran puis le lit de bout en bout sans reseau", async () => {
    await seedDownloadedQuran(["fr-concise"]);

    // Le stock est signale comme complet (114 sourates).
    await expect(isOfflineQuranReady()).resolves.toBe(true);

    // 1. Liste des sourates, triee par numero.
    const surahs = await getOfflineSurahs();
    expect(surahs).toHaveLength(114);
    expect(surahs[0].number).toBe(1);
    expect(surahs[113].number).toBe(114);

    // 2. Detail d'une sourate : versets resumes dans l'ordre.
    const detail = await getOfflineSurahDetail(1);
    expect(detail).not.toBeNull();
    expect(detail!.nameArabic).toBe("سُورَة 1");
    expect(detail!.verses).toHaveLength(7);
    expect(detail!.verses[0]).toEqual({
      id: "1:1",
      numberInSurah: 1,
      textArabic: "آيَة 1:1",
      textTransliterated: "ayah 1:1",
    });

    // 3. Verset isole.
    const verse = await getOfflineVerse(1, 2);
    expect(verse).not.toBeNull();
    expect(verse!.textArabic).toBe("آيَة 1:2");

    // 4. Traduction d'une sourate, dans l'ordre des versets.
    const translation = await getOfflineSurahTranslation(1, "fr-concise");
    expect(translation).toHaveLength(7);
    expect(translation[0]).toEqual({ numberInSurah: 1, text: "traduction 1:1" });

    // 5. Traductions telechargees.
    await expect(getOfflineDownloadedTranslationIds()).resolves.toEqual(["fr-concise"]);

    // 6. Version stockee : sert a comparer avec le serveur pour detecter
    //    une mise a jour du contenu.
    await expect(offlineDb.getQuranVersion()).resolves.toBe("1");
  });

  it("renvoie null quand la sourate ou le verset n'existe pas hors-ligne", async () => {
    await seedDownloadedQuran([]);

    await expect(getOfflineSurahDetail(200)).resolves.toBeNull();
    await expect(getOfflineVerse(1, 999)).resolves.toBeNull();
  });

  it("n'est pas pret tant que les 114 sourates ne sont pas toutes telechargees", async () => {
    // Telechargement partiel : seulement 10 sourates.
    await offlineDb.surahs.bulkPut([
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `s-${i + 1}`,
        number: i + 1,
        nameArabic: `س`,
        nameTransliterated: "S",
        nameTranslated: null,
        versesCount: 1,
        revelationPlace: "mecca" as const,
        generalInfo: null,
        themes: null,
      })),
    ]);
    await expect(isOfflineQuranReady()).resolves.toBe(false);
  });

  it("clearQuran vide le stock : plus aucune lecture hors-ligne possible", async () => {
    await seedDownloadedQuran(["fr-concise"]);
    await expect(isOfflineQuranReady()).resolves.toBe(true);

    await offlineDb.clearQuran();

    await expect(isOfflineQuranReady()).resolves.toBe(false);
    await expect(getOfflineSurahs()).resolves.toEqual([]);
    await expect(getOfflineSurahDetail(1)).resolves.toBeNull();
    await expect(getOfflineSurahTranslation(1, "fr-concise")).resolves.toEqual([]);
    await expect(getOfflineDownloadedTranslationIds()).resolves.toEqual([]);
    await expect(offlineDb.getQuranVersion()).resolves.toBeNull();
  });
});