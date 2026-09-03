export interface KhatmProgress {
  id: string;
  hijriYear: number;
  lastSurahNumber: number;
  lastVerseNumber: number;
  versesCompleted: number;
  completedAt: string | null;
}

export interface UpsertKhatmProgressInput {
  surahNumber: number;
  verseNumber: number;
}
