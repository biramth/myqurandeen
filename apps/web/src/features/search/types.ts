export interface SearchResults {
  verses: { id: string; surahNumber: number; surahName: string; numberInSurah: number; textArabic: string }[];
  hadiths: {
    id: string;
    collectionSlug: string;
    collectionName: string;
    bookNumber: number;
    number: string;
    numberInCollection: string;
    textTranslation: string;
  }[];
  tafsirEntries: { id: string; workTitle: string; surahNumber: number; numberInSurah: number; content: string }[];
  concepts: { id: string; term: string; slug: string; definition: string }[];
  scholars: { id: string; name: string; slug: string; bio: string | null }[];
  prophets: { id: string; name: string; slug: string; description: string }[];
  events: { id: string; title: string; slug: string; periodSlug: string; description: string }[];
  fiqhTopics: { id: string; title: string; slug: string; description: string | null }[];
  schools: { id: string; name: string; slug: string; type: string }[];
}
