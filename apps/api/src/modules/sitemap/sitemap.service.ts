import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { withConcurrencyLimit } from "../../common/concurrency/db-query-semaphore";
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
import { SITEMAP_PART_PATHS, formatDate, toIndexXml, toXml } from "./sitemap-xml";

/**
 * Limite du standard sitemap : 50 000 URLs maximum par fichier. Le volume
 * actuel (~6 200 versets + ~33 500 hadiths + le reste, ~40k au total) reste
 * sous ce seuil, mais on sharde des maintenant par type de contenu pour que
 * chaque sous-fichier garde une taille raisonnable et que la croissance
 * (~nombre de hadiths/versets) ne force pas une migration coûteuse plus tard.
 */
export const MAX_URLS_PER_SITEMAP = 50_000;

/** Sous-sitemaps logiques, chacun une route dediee (voir SitemapController). */
export type SitemapPart = "static" | "quran" | "hadith";

interface SitemapUrl {
  loc: string;
  lastmod?: string | null;
}

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

/**
 * Genere les sitemaps a partir du contenu reel en base - la SPA etant
 * purement cote client (voir MailService/PageMeta pour le meme constat cote
 * emails), c'est ce endpoint qui donne a Google la liste complete des URLs
 * de contenu a indexer, plutot que de compter sur le crawl seul.
 *
 * Chaque sous-sitemap ne charge QUE les tables dont il a besoin (pas les 3
 * a chaque appel) : `generatePart("static")` declenchait auparavant les
 * memes 6 requetes que "quran"/"hadith" EN PLUS de ses 10 propres requetes
 * (16 requetes paralleles au total, pour un pool Postgres borne a 15
 * connexions - `EMAXCONNSESSION` systematique, meme sans aucun autre trafic
 * concurrent). Les requetes restantes passent par `withConcurrencyLimit`
 * (semaphore partage avec `SearchService`, voir
 * `common/concurrency/db-query-semaphore.ts`) en defense en profondeur.
 */
@Injectable()
export class SitemapService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /** sitemap.xml racine : un index qui pointe vers les sous-sitemaps. */
  async generateIndex(): Promise<string> {
    return toIndexXml(SITEMAP_PART_PATHS);
  }

  /** Sous-sitemap d'une categorie donnee ; le volume par categorie est < MAX_URLS_PER_SITEMAP par construction. */
  async generatePart(part: SitemapPart): Promise<string> {
    const urls = await this.collectUrls(part);
    return toXml(urls);
  }

  private async collectUrls(part: SitemapPart): Promise<SitemapUrl[]> {
    switch (part) {
      case "quran":
        return this.collectQuranUrls();
      case "hadith":
        return this.collectHadithUrls();
      default:
        return this.collectStaticUrls();
    }
  }

  private async collectQuranUrls(): Promise<SitemapUrl[]> {
    const [surahs, verses] = await withConcurrencyLimit([
      () => this.db.select({ number: quranSurahs.number, updatedAt: quranSurahs.updatedAt }).from(quranSurahs),
      () =>
        this.db
          .select({ numberInSurah: quranVerses.numberInSurah, surahNumber: quranSurahs.number, updatedAt: quranVerses.updatedAt })
          .from(quranVerses)
          .innerJoin(quranSurahs, eq(quranVerses.surahId, quranSurahs.id)),
    ]);

    const urls: SitemapUrl[] = [];
    for (const s of surahs) urls.push({ loc: `/quran/${s.number}`, lastmod: formatDate(s.updatedAt) });
    for (const v of verses) urls.push({ loc: `/quran/${v.surahNumber}/${v.numberInSurah}`, lastmod: formatDate(v.updatedAt) });
    return urls;
  }

  private async collectHadithUrls(): Promise<SitemapUrl[]> {
    const [hadithCollectionRows, hadithBookRows, hadithRows] = await withConcurrencyLimit([
      () => this.db.select({ slug: hadithCollections.slug, updatedAt: hadithCollections.updatedAt }).from(hadithCollections),
      () =>
        this.db
          .select({ number: hadithBooks.number, collectionSlug: hadithCollections.slug, updatedAt: hadithBooks.updatedAt })
          .from(hadithBooks)
          .innerJoin(hadithCollections, eq(hadithBooks.collectionId, hadithCollections.id)),
      () =>
        this.db
          .select({ numberInCollection: hadiths.numberInCollection, collectionSlug: hadithCollections.slug, updatedAt: hadiths.updatedAt })
          .from(hadiths)
          .innerJoin(hadithCollections, eq(hadiths.collectionId, hadithCollections.id)),
    ]);

    const urls: SitemapUrl[] = [];
    for (const c of hadithCollectionRows) urls.push({ loc: `/hadith/${c.slug}`, lastmod: formatDate(c.updatedAt) });
    for (const b of hadithBookRows) {
      urls.push({ loc: `/hadith/${b.collectionSlug}/book/${b.number}`, lastmod: formatDate(b.updatedAt) });
    }
    for (const h of hadithRows) {
      urls.push({ loc: `/hadith/${h.collectionSlug}/${h.numberInCollection}`, lastmod: formatDate(h.updatedAt) });
    }
    return urls;
  }

  /** Routes statiques (listes/accueil) + toutes les petites ressources editoriales - volontairement sous les 50k. */
  private async collectStaticUrls(): Promise<SitemapUrl[]> {
    const [
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
    ] = await withConcurrencyLimit([
      () => this.db.select({ slug: duaCategories.slug, updatedAt: duaCategories.updatedAt }).from(duaCategories),
      () => this.db.select({ slug: historicalPeriods.slug, updatedAt: historicalPeriods.updatedAt }).from(historicalPeriods),
      () => this.db.select({ slug: historicalEvents.slug, updatedAt: historicalEvents.updatedAt }).from(historicalEvents),
      () => this.db.select({ slug: schools.slug, updatedAt: schools.updatedAt }).from(schools),
      () => this.db.select({ slug: fiqhTopics.slug, updatedAt: fiqhTopics.updatedAt }).from(fiqhTopics),
      () => this.db.select({ slug: prophets.slug, updatedAt: prophets.updatedAt }).from(prophets),
      () => this.db.select({ slug: concepts.slug, updatedAt: concepts.updatedAt }).from(concepts),
      () => this.db.select({ slug: scholars.slug, updatedAt: scholars.updatedAt }).from(scholars),
      () => this.db.select({ slug: learningPaths.slug, updatedAt: learningPaths.updatedAt }).from(learningPaths),
      () => this.db.select({ slug: books.slug, updatedAt: books.updatedAt }).from(books),
    ]);

    const urls: SitemapUrl[] = STATIC_PATHS.map((path) => ({ loc: path }));
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
}
