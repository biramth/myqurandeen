import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConceptsService } from "../concepts/concepts.service";
import { DuasService } from "../duas/duas.service";
import { HadithService } from "../hadith/hadith.service";
import { HistoryService } from "../history/history.service";
import { QuranService } from "../quran/quran.service";
import { ScholarsService } from "../scholars/scholars.service";

const SITE_URL = "https://myqurandeen.vercel.app";
const DEFAULT_DESCRIPTION =
  "myQurandeen - plateforme open-source d'étude du Coran, du hadith, du tafsir, du fiqh et de l'histoire de l'Islam.";

interface OgMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  /** Query string params (already right names) de l'image OG dynamique. */
  imageParams: {
    title?: string;
    arabic?: string;
    transliteration?: string;
    body?: string;
    source?: string;
  };
}

/**
 * Pre-rendu HTML cote serveur ("SEO head") pour un contenu donne, destine aux
 * crawlers d'apercu de lien (WhatsApp, X, Discord, Slack...) qui n'executent
 * pas le JS de la SPA. Le middleware Edge Vercel (middleware.ts a la racine)
 * detecte ces user-agents et reecrit la requete vers ce endpoint : le crawler
 * recoit un mini-document HTML complet avec le bon <head> Open Graph, dont
 * l'og:image pointe vers /api/og (la carte visuelle par contenu genere par
 * satori+sharp). Sur une URL partagee non-SPA, on renvoie la description
 * generique de repli.
 *
 * Note : on appelle directement les services NestJS des modules de contenu
 * (pas de HTTP interne) - simples, et ca profite de leur cache en memoire.
 */
@Injectable()
export class OgPageService {
  private readonly logger = new Logger(OgPageService.name);

  constructor(
    private readonly quranService: QuranService,
    private readonly hadithService: HadithService,
    private readonly duasService: DuasService,
    private readonly historyService: HistoryService,
    private readonly conceptsService: ConceptsService,
    private readonly scholarsService: ScholarsService,
  ) {}

  /**
   * Construit la meta OG pour un chemin de contenu. Retourne null si le chemin
   * ne correspond a aucun contenu connu (ou erreur de contenu).
   */
  async resolvePath(path: string): Promise<OgMeta | null> {
    const segments = path.split("/").filter(Boolean);

    try {
      if (segments[0] === "quran" && segments.length === 3) {
        const surah = Number(segments[1]);
        const verseNumber = Number(segments[2]);
        if (!Number.isInteger(surah) || !Number.isInteger(verseNumber)) return null;
        const data = await this.quranService.getVerse(surah, verseNumber);
        const surahName = data.surah.nameTransliterated;
        const title = `${surahName} ${data.verse.numberInSurah}`;
        const body = data.translations[0]?.text;
        return {
          title,
          description: body ?? DEFAULT_DESCRIPTION,
          canonicalUrl: `/quran/${surah}/${verseNumber}`,
          imageParams: {
            title,
            arabic: data.verse.textArabic,
            transliteration: data.verse.textTransliterated ?? undefined,
            body,
            source: `${surahName} — Verset ${data.verse.numberInSurah}`,
          },
        };
      }

      if (segments[0] === "hadith" && segments.length === 3) {
        const data = await this.hadithService.getHadithDetail(segments[1], segments[2]);
        const title = `${data.collection.name} ${data.hadith.number}`;
        const body = data.hadith.textTranslation;
        return {
          title,
          description: body ?? DEFAULT_DESCRIPTION,
          canonicalUrl: `/hadith/${segments[1]}/${segments[2]}`,
          imageParams: {
            title,
            arabic: data.hadith.textArabic ?? undefined,
            body,
            source: data.book ? `${data.collection.name} — ${data.book.title}` : data.collection.name,
          },
        };
      }

      if (segments[0] === "duas" && segments.length === 2) {
        const data = await this.duasService.getCategory(segments[1]);
        return {
          title: data.category.name,
          description: data.category.description ?? DEFAULT_DESCRIPTION,
          canonicalUrl: `/duas/${segments[1]}`,
          imageParams: {
            title: data.category.name,
            body: data.category.description ?? undefined,
            source: "Duas",
          },
        };
      }

      if (segments[0] === "history" && segments[1] === "event" && segments.length === 3) {
        const data = await this.historyService.getEvent(segments[2]);
        return {
          title: data.event.title,
          description: data.event.description ?? DEFAULT_DESCRIPTION,
          canonicalUrl: `/history/event/${segments[2]}`,
          imageParams: {
            title: data.event.title,
            body: data.event.description ?? undefined,
            source: data.period?.name,
          },
        };
      }

      if (segments[0] === "concepts" && segments.length === 2) {
        const data = await this.conceptsService.getConcept(segments[1]);
        return {
          title: data.term,
          description: data.definition ?? DEFAULT_DESCRIPTION,
          canonicalUrl: `/concepts/${segments[1]}`,
          imageParams: {
            title: data.term,
            arabic: data.termArabic ?? undefined,
            body: data.definition ?? undefined,
          },
        };
      }

      if (segments[0] === "scholars" && segments.length === 2) {
        const data = await this.scholarsService.getScholar(segments[1]);
        return {
          title: data.name,
          description: data.bio ?? DEFAULT_DESCRIPTION,
          canonicalUrl: `/scholars/${segments[1]}`,
          imageParams: {
            title: data.name,
            arabic: data.nameArabic ?? undefined,
            body: data.bio ?? undefined,
          },
        };
      }
    } catch (error) {
      if (error instanceof NotFoundException) return null;
      this.logger.error(
        `Erreur prerender OG pour "${path}"`,
        error instanceof Error ? error.stack : String(error),
      );
      return null;
    }

    return null;
  }

  /**
   * Rendu HTML complet (head SEO/OG seul, pas la SPA) pour un chemin de
   * contenu. Lance NotFoundException si le contenu n'existe pas / chemin inconnu.
   */
  async renderHtml(path: string): Promise<string> {
    const meta = await this.resolvePath(path);
    if (!meta) {
      throw new NotFoundException(`Contenu "${path}" introuvable pour le pre-rendu OG`);
    }
    return this.buildHead(meta);
  }

  private buildHead(meta: OgMeta): string {
    const ogImage = this.buildOgImageUrl(meta.imageParams);
    const canonical = `${SITE_URL}${meta.canonicalUrl}`;
    const escape = (value: string): string =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const fullTitle = `${meta.title} · myQurandeen`;
    const closing = escape(meta.description);

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escape(fullTitle)}</title>
    <meta name="description" content="${closing}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="myQurandeen" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escape(fullTitle)}" />
    <meta property="og:description" content="${closing}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(fullTitle)}" />
    <meta name="twitter:description" content="${closing}" />
    <meta name="twitter:image" content="${ogImage}" />
  </head>
  <body>
    <h1>${escape(fullTitle)}</h1>
    <p>${closing}</p>
  </body>
</html>`;
  }

  /** Reproduit buildOgImage du frontend : URL `.../api/og?title&arabic&transliteration&body&source`. */
  private buildOgImageUrl(params: OgMeta["imageParams"]): string {
    const search = new URLSearchParams();
    if (params.title) search.set("title", params.title);
    if (params.arabic) search.set("arabic", params.arabic);
    if (params.transliteration) search.set("transliteration", params.transliteration);
    if (params.body) search.set("body", params.body);
    if (params.source) search.set("source", params.source);
    return `${SITE_URL}/api/og?${search.toString()}`;
  }
}
