export interface TafsirWork {
  id: string;
  title: string;
  language: string;
  era: string | null;
  description: string | null;
  authorName: string | null;
}

export interface VerseTafsir {
  tafsirSourceId: string;
  workTitle: string;
  language: string;
  authorName: string | null;
  content: string;
}

export interface SurahTafsirRow {
  numberInSurah: number;
  content: string;
}
