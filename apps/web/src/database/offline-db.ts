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

class OfflineDatabase extends Dexie {
  surahs!: Table<OfflineSurah, number>;
  verses!: Table<OfflineVerse, string>;
  translations!: Table<OfflineTranslation, string>;
  metadata!: Table<OfflineMetadata, string>;

  constructor() {
    super("qurandeen-offline");
    this.version(1).stores({
      surahs: "number",
      verses: "[surahNumber+numberInSurah], surahNumber",
      translations: "id, surahNumber, translationId, numberInSurah",
      metadata: "key",
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

  async clearQuran(): Promise<void> {
    await this.surahs.clear();
    await this.verses.clear();
    await this.translations.clear();
    await this.metadata.delete("quran-version");
  }
}

export const offlineDb = new OfflineDatabase();
