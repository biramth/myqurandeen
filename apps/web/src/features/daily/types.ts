export interface DailyVerseTranslation {
  translationId: string;
  language: string;
  translatorName: string | null;
  text: string;
}

export interface DailyVerse {
  id: string;
  numberInSurah: number;
  textArabic: string;
  textTransliterated: string | null;
  surahNumber: number;
  surahNameArabic: string;
  surahNameTransliterated: string;
  translation: DailyVerseTranslation | null;
}

export interface DailyHadith {
  id: string;
  number: number;
  numberInCollection: string;
  textArabic: string | null;
  textTranslation: string | null;
  authenticityGrade: string | null;
  collectionSlug: string;
  collectionName: string;
}

export interface DailyContent {
  verse: DailyVerse | null;
  hadith: DailyHadith | null;
}
