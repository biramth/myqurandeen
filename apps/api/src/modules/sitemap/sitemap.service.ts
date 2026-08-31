import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import {
  books,
  concepts,
  duaCategories,
  fiqhTopics,
  hadithBooks,
  hadithCollections,
  hadiths,
  historicalEvents,
  historicalPeriods,
  learningPaths,
  prophets,
  quranSurahs,
  quranVerses,
  scholars,
  schools,
} from "../../database/schema";

interface SitemapUrl {
  loc: string;
  lastmod?: string | null;
}

/** Base publique du site (pas une variable d'env dediee : voir le meme choix pour SITE_URL cote frontend, PageMeta.tsx). */
const SITE_URL = "https://myqurandeen.vercel.app";

/**
 * Routes statiques (listes/pages sans identifiant dynamique). Les routes
 * privees (login, admin, profil...) et les sous-routes de quiz/lecon sont
 * volontairement exclues - faible valeur de crawl, chaine de slugs a
 * reconstituer pour peu de benefice.
 */
const STATIC_PATHS = [
  "/",
  "/quran",
  "/hadith",
  "/tafsir",
  "/duas",
  "/history",
  "/schools",
  "/fiqh",
  "/prophets",
  "/concepts",
  "/scholars",
  "/learn",
  "/library",
  "/search",
];

function formatDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/** Slugs/identifiants venant de la base (editoriaux, pas de saisie utilisateur libre) - echappe quand meme par prudence. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Genere le sitemap.xml a partir du contenu reel en base - la SPA etant
 * purement cote client (voir MailService/PageMeta pour le meme constat cote
 * emails), c'est ce endpoint qui donne a Google la liste complete des URLs
 * de contenu a indexer, plutot que de compter sur le crawl seul.
 */
@Injectable()
export class SitemapService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async generate(): Promise<string> {
    const urls = await this.collectUrls();
    return this.toXml(urls);
  }

  private async collectUrls(): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = STATIC_PATHS.map((path) => ({ loc: path }));

    const [
      surahs,
      verses,
      hadithCollectionRows,
      hadithBookRows,
      hadithRows,
      duaCategoryRows,
      historyPeriodRows,
      historyEventRows,
      schoolRows,
      fiqhTopicRows,
      prophetRows,
      conceptRows,
      scholarRows,
      learningPathRows,
      bookRows,
    ] = await Promise.all([
      this.db.select({ number: quranSurahs.number, updatedAt: quranSurahs.updatedAt }).from(quranSurahs),
      this.db
        .select({ numberInSurah: quranVerses.numberInSurah, surahNumber: quranSurahs.number, updatedAt: quranVerses.updatedAt })
        .from(quranVerses)
        .innerJoin(quranSurahs, eq(quranVerses.surahId, quranSurahs.id)),
      this.db.select({ slug: hadithCollections.slug, updatedAt: hadithCollections.updatedAt }).from(hadithCollections),
      this.db
        .select({ number: hadithBooks.number, collectionSlug: hadithCollections.slug, updatedAt: hadithBooks.updatedAt })
        .from(hadithBooks)
        .innerJoin(hadithCollections, eq(hadithBooks.collectionId, hadithCollections.id)),
      this.db
        .select({ numberInCollection: hadiths.numberInCollection, collectionSlug: hadithCollections.slug, updatedAt: hadiths.updatedAt })
        .from(hadiths)
        .innerJoin(hadithCollections, eq(hadiths.collectionId, hadithCollections.id)),
      this.db.select({ slug: duaCategories.slug, updatedAt: duaCategories.updatedAt }).from(duaCategories),
      this.db.select({ slug: historicalPeriods.slug, updatedAt: historicalPeriods.updatedAt }).from(historicalPeriods),
      this.db.select({ slug: historicalEvents.slug, updatedAt: historicalEvents.updatedAt }).from(historicalEvents),
      this.db.select({ slug: schools.slug, updatedAt: schools.updatedAt }).from(schools),
      this.db.select({ slug: fiqhTopics.slug, updatedAt: fiqhTopics.updatedAt }).from(fiqhTopics),
      this.db.select({ slug: prophets.slug, updatedAt: prophets.updatedAt }).from(prophets),
      this.db.select({ slug: concepts.slug, updatedAt: concepts.updatedAt }).from(concepts),
      this.db.select({ slug: scholars.slug, updatedAt: scholars.updatedAt }).from(scholars),
      this.db.select({ slug: learningPaths.slug, updatedAt: learningPaths.updatedAt }).from(learningPaths),
      this.db.select({ slug: books.slug, updatedAt: books.updatedAt }).from(books),
    ]);

    for (const s of surahs) urls.push({ loc: `/quran/${s.number}`, lastmod: formatDate(s.updatedAt) });
    for (const v of verses) urls.push({ loc: `/quran/${v.surahNumber}/${v.numberInSurah}`, lastmod: formatDate(v.updatedAt) });
    for (const c of hadithCollectionRows) urls.push({ loc: `/hadith/${c.slug}`, lastmod: formatDate(c.updatedAt) });
    for (const b of hadithBookRows) urls.push({ loc: `/hadith/${b.collectionSlug}/book/${b.number}`, lastmod: formatDate(b.updatedAt) });
    for (const h of hadithRows) {
      urls.push({ loc: `/hadith/${h.collectionSlug}/${h.numberInCollection}`, lastmod: formatDate(h.updatedAt) });
    }
    for (const d of duaCategoryRows) urls.push({ loc: `/duas/${d.slug}`, lastmod: formatDate(d.updatedAt) });
    for (const p of historyPeriodRows) urls.push({ loc: `/history/${p.slug}`, lastmod: formatDate(p.updatedAt) });
    for (const e of historyEventRows) urls.push({ loc: `/history/event/${e.slug}`, lastmod: formatDate(e.updatedAt) });
    for (const s of schoolRows) urls.push({ loc: `/schools/${s.slug}`, lastmod: formatDate(s.updatedAt) });
    for (const f of fiqhTopicRows) urls.push({ loc: `/fiqh/${f.slug}`, lastmod: formatDate(f.updatedAt) });
    for (const p of prophetRows) urls.push({ loc: `/prophets/${p.slug}`, lastmod: formatDate(p.updatedAt) });
    for (const c of conceptRows) urls.push({ loc: `/concepts/${c.slug}`, lastmod: formatDate(c.updatedAt) });
    for (const s of scholarRows) urls.push({ loc: `/scholars/${s.slug}`, lastmod: formatDate(s.updatedAt) });
    for (const l of learningPathRows) urls.push({ loc: `/learn/${l.slug}`, lastmod: formatDate(l.updatedAt) });
    for (const b of bookRows) urls.push({ loc: `/library/${b.slug}`, lastmod: formatDate(b.updatedAt) });

    return urls;
  }

  private toXml(urls: SitemapUrl[]): string {
    const body = urls
      .map((u) => {
        const loc = escapeXml(`${SITE_URL}${u.loc}`);
        const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
        return `  <url><loc>${loc}</loc>${lastmod}</url>`;
      })
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  }
}
