import type { SearchResults } from "./types";

export interface QuickResult {
  key: string;
  href: string;
  primary: string;
  secondary?: string | null;
  badgeKey: string;
}

const QUICK_RESULT_LIMIT = 8;

/**
 * Aplatit les differentes categories de `SearchResults` en une liste unique,
 * courte, triee par pertinence "type" (versets et hadiths d'abord) plutot
 * que par score exact - suffisant pour un apercu instantane pendant la
 * frappe ; la page /search reste l'endroit pour une recherche exhaustive et
 * filtrable par categorie.
 */
export function buildQuickResults(data: SearchResults): QuickResult[] {
  const results: QuickResult[] = [];

  for (const v of data.verses) {
    results.push({
      key: `verse-${v.id}`,
      href: `/quran/${v.surahNumber}/${v.numberInSurah}`,
      primary: `${v.surahName} ${v.surahNumber}:${v.numberInSurah}`,
      secondary: v.textTransliterated,
      badgeKey: "nav.quran",
    });
  }
  for (const h of data.hadiths) {
    results.push({
      key: `hadith-${h.id}`,
      href: `/hadith/${h.collectionSlug}/${h.numberInCollection}`,
      primary: `${h.collectionName} · ${h.number}`,
      secondary: h.textTranslation,
      badgeKey: "nav.hadith",
    });
  }
  for (const d of data.duas) {
    results.push({
      key: `dua-${d.id}`,
      href: `/duas/${d.categorySlug}`,
      primary: d.title,
      secondary: d.translation,
      badgeKey: "duas.title",
    });
  }
  for (const c of data.concepts) {
    results.push({
      key: `concept-${c.id}`,
      href: `/concepts/${c.slug}`,
      primary: c.term,
      secondary: c.definition,
      badgeKey: "concepts.title",
    });
  }
  for (const p of data.prophets) {
    results.push({
      key: `prophet-${p.id}`,
      href: `/prophets/${p.slug}`,
      primary: p.name,
      secondary: p.description,
      badgeKey: "prophets.title",
    });
  }
  for (const s of data.scholars) {
    results.push({
      key: `scholar-${s.id}`,
      href: `/scholars/${s.slug}`,
      primary: s.name,
      secondary: s.bio,
      badgeKey: "scholars.title",
    });
  }
  for (const e of data.events) {
    results.push({
      key: `event-${e.id}`,
      href: `/history/event/${e.slug}`,
      primary: e.title,
      secondary: e.description,
      badgeKey: "history.title",
    });
  }
  for (const f of data.fiqhTopics) {
    results.push({
      key: `fiqh-${f.id}`,
      href: `/fiqh/${f.slug}`,
      primary: f.title,
      secondary: f.description,
      badgeKey: "schools.comparatorTitle",
    });
  }
  for (const sc of data.schools) {
    results.push({
      key: `school-${sc.id}`,
      href: `/schools/${sc.slug}`,
      primary: sc.name,
      badgeKey: "schools.title",
    });
  }
  for (const t of data.tafsirEntries) {
    results.push({
      key: `tafsir-${t.id}`,
      href: `/quran/${t.surahNumber}/${t.numberInSurah}`,
      primary: `${t.workTitle} · ${t.surahNumber}:${t.numberInSurah}`,
      secondary: t.content,
      badgeKey: "comingSoon.tafsir.title",
    });
  }
  for (const b of data.books) {
    results.push({
      key: `book-${b.id}`,
      href: `/library/${b.slug}`,
      primary: b.title,
      secondary: b.description,
      badgeKey: "library.title",
    });
  }

  return results.slice(0, QUICK_RESULT_LIMIT);
}
