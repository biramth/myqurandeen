export interface HadithCollection {
  id: string;
  slug: string;
  name: string;
  nameArabic: string | null;
  description: string | null;
  compilerName: string | null;
}

export interface HadithBook {
  id: string;
  number: number;
  title: string;
}

export interface HadithCollectionDetail extends HadithCollection {
  books: HadithBook[];
}

export interface HadithListItem {
  id: string;
  number: string;
  numberInCollection: string;
  textArabic: string | null;
  textTranslation: string;
  authenticityGrade: string | null;
}

export interface HadithBookPage {
  book: { number: number; title: string };
  page: number;
  pageSize: number;
  hadiths: HadithListItem[];
}

export interface HadithGrade {
  graderName: string;
  grade: string;
}

export interface HadithTranslationEdition {
  id: string;
  name: string;
  language: string;
}

export interface HadithVerseTranslation {
  translationId: string;
  translationName: string;
  language: string;
  text: string;
}

export interface HadithDetail {
  collection: { slug: string; name: string };
  book: { number: number; title: string } | null;
  hadith: {
    id: string;
    number: string;
    numberInCollection: string;
    textArabic: string | null;
    textTranslation: string;
    authenticityGrade: string | null;
  };
  grades: HadithGrade[];
  translations: HadithVerseTranslation[];
}

export interface HadithBookTranslationRow {
  numberInCollection: string;
  text: string;
}
