export interface Surah {
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

export interface VerseSummary {
  id: string;
  numberInSurah: number;
  textArabic: string;
  textTransliterated: string | null;
}

export interface SurahDetail extends Surah {
  verses: VerseSummary[];
}

export interface VerseTranslation {
  translationId: string;
  translationName: string;
  language: string;
  translatorName: string | null;
  text: string;
}

export interface VerseDetail {
  surah: { number: number; nameArabic: string; nameTransliterated: string };
  verse: VerseSummary;
  translations: VerseTranslation[];
}

export interface TranslationEdition {
  id: string;
  name: string;
  language: string;
  translatorName: string | null;
}

export interface SurahTranslationRow {
  numberInSurah: number;
  text: string;
}

export interface Reciter {
  id: string;
  slug: string;
  nameArabic: string;
  nameTransliterated: string;
  style: string;
  bitrate: number;
}

export interface VerseAudioReciter extends Reciter {
  url: string;
  durationSec: number | null;
}

export interface VerseAudioResponse {
  items: VerseAudioReciter[];
}
