import Dexie, { type Table } from "dexie";

export interface OfflineSurah {
  id: string;
  number: number;
  nameArabic: string;
  nameTransliterated: string;
  nameTranslated: string | null;
  versesCount: number;
  revelationPlace: "mecca" | "medina" | "uncertain" | null;
  generalInfo: string | null;
  themes: string[] | null;
}

export interface OfflineVerse {
  id: string;
  surahNumber: number;
  numberInSurah: number;
  textArabic: string;
  textTransliterated: string | null;
}

export interface OfflineTranslation {
  id: string;
  surahNumber: number;
  numberInSurah: number;
  translationId: string;
  text: string;
}

export interface OfflineMetadata {
  key: string;
  value: string;
}

/** Une piste audio telechargee pour l'ecoute hors-ligne (une par verset). */
export interface OfflineAudioTrack {
  id: string; // `${reciterSlug}:${surahNumber}:${numberInSurah}`
  reciterSlug: string;
  reciterName: string;
  surahNumber: number;
  numberInSurah: number;
  durationSec: number | null;
  blob: Blob;
}

export interface OfflineAudioSurahSummary {
  reciterSlug: string;
  reciterName: string;
  surahNumber: number;
  surahName: string | null;
  totalBytes: number;
}

class OfflineDatabase extends Dexie {
  surahs!: Table<OfflineSurah, number>;
  verses!: Table<OfflineVerse, string>;
  translations!: Table<OfflineTranslation, string>;
  metadata!: Table<OfflineMetadata, string>;
  audioTracks!: Table<OfflineAudioTrack, string>;

  constructor() {
    super("qurandeen-offline");
    this.version(1).stores({
      surahs: "number",
      verses: "[surahNumber+numberInSurah], surahNumber",
      translations: "id, surahNumber, translationId, numberInSurah",
      metadata: "key",
    });
    // v2 : ajout du stockage audio hors-ligne (Blob par verset) - toutes les
    // stores existantes doivent etre re-listees (convention Dexie), leur
    // contenu est conserve tel quel puisque leur definition ne change pas.
    this.version(2).stores({
      surahs: "number",
      verses: "[surahNumber+numberInSurah], surahNumber",
      translations: "id, surahNumber, translationId, numberInSurah",
      metadata: "key",
      audioTracks: "id, [reciterSlug+surahNumber], surahNumber",
    });
  }

  async isQuranDownloaded(): Promise<boolean> {
    const count = await this.surahs.count();
    return count === 114;
  }

  async getQuranVersion(): Promise<string | null> {
    const row = await this.metadata.get("quran-version");
    return row?.value ?? null;
  }

  async setQuranVersion(version: string): Promise<void> {
    await this.metadata.put({ key: "quran-version", value: version });
  }

  async getDownloadedTranslationIds(): Promise<string[]> {
    const rows = await this.translations.orderBy("translationId").toArray();
    return Array.from(new Set(rows.map((row) => row.translationId)));
  }

  async setDownloadedTranslations(ids: string[]): Promise<void> {
    await this.metadata.put({ key: "downloaded-translations", value: JSON.stringify(ids) });
  }

  async getDownloadedTranslations(): Promise<string[]> {
    const row = await this.metadata.get("downloaded-translations");
    if (!row?.value) return [];
    try {
      const parsed = JSON.parse(row.value) as unknown;
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }

  async clearQuran(): Promise<void> {
    await this.surahs.clear();
    await this.verses.clear();
    await this.translations.clear();
    await this.metadata.delete("quran-version");
    await this.metadata.delete("downloaded-translations");
  }

  async putAudioTrack(track: OfflineAudioTrack): Promise<void> {
    await this.audioTracks.put(track);
  }

  async getAudioTrack(
    reciterSlug: string,
    surahNumber: number,
    numberInSurah: number,
  ): Promise<OfflineAudioTrack | undefined> {
    return this.audioTracks.get(`${reciterSlug}:${surahNumber}:${numberInSurah}`);
  }

  async isSurahAudioDownloaded(reciterSlug: string, surahNumber: number, versesCount: number): Promise<boolean> {
    if (versesCount <= 0) return false;
    const count = await this.audioTracks.where("[reciterSlug+surahNumber]").equals([reciterSlug, surahNumber]).count();
    return count === versesCount;
  }

  async removeSurahAudio(reciterSlug: string, surahNumber: number): Promise<void> {
    await this.audioTracks.where("[reciterSlug+surahNumber]").equals([reciterSlug, surahNumber]).delete();
  }

  /** Regroupe les pistes telechargees par (recitateur, sourate) pour l'onglet "Hors-ligne". */
  async listDownloadedAudioSurahs(): Promise<OfflineAudioSurahSummary[]> {
    const rows = await this.audioTracks.toArray();
    const map = new Map<string, { reciterSlug: string; reciterName: string; surahNumber: number; totalBytes: number }>();
    for (const row of rows) {
      const key = `${row.reciterSlug}:${row.surahNumber}`;
      const existing = map.get(key);
      if (existing) {
        existing.totalBytes += row.blob.size;
      } else {
        map.set(key, {
          reciterSlug: row.reciterSlug,
          reciterName: row.reciterName,
          surahNumber: row.surahNumber,
          totalBytes: row.blob.size,
        });
      }
    }
    const entries = Array.from(map.values()).sort(
      (a, b) => a.surahNumber - b.surahNumber || a.reciterSlug.localeCompare(b.reciterSlug),
    );
    return Promise.all(
      entries.map(async (entry) => {
        const surah = await this.surahs.get(entry.surahNumber);
        return { ...entry, surahName: surah?.nameTransliterated ?? null };
      }),
    );
  }
}

export const offlineDb = new OfflineDatabase();
