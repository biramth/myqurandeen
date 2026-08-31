import { Injectable, Logger } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";

// Structure minimale d'un element satori (tree d'objets simples, sans react).
interface OGElement {
  type: string;
  props: { style: Record<string, unknown>; children: (string | OGElement)[] };
}

/**
 * Rendu de la carte OG 1200x630 par contenu (Coran, hadith, dua, histoire,
 * concepts) - le "vrai" apercu de lien que les crawlers (WhatsApp, X,
 * Discord, Slack...) affichent quand on colle l'URL, au lieu de l'icone.
 *
 * Cote backend NestJS (Render) et non fonction Vercel : la fonction/edge
 * Vercel du dossier api/ echouait a charger le .wasm de satori a l'execution
 * (FUNCTION_INVOCATION_FAILED) - le bundler du dossier api/ d'un projet sans
 * framework ne gere pas les assets wasm des dependances. Sur un serveur Node
 * ordinaire (ici le backend), satori (SVG) + sharp (SVG->PNG) tournent sans
 * probleme. Vercel reecrit /api/(.*) vers ce backend (voir vercel.json).
 *
 * satori est ESM-only : on l'importe via import() dynamique, que CommonJS
 * (sortie de nest build) charge correctement sur Node >= 20. sharp supporte
 * les deux ; on garde aussi un import() dynamique pour l'uniformite et pour
 * ne rien charger au boot (premier rendu lazzy).
 */
@Injectable()
export class OgService {
  private readonly logger = new Logger(OgService.name);
  private fontCache: Buffer | null = null;

  private static readonly ARABIC_REGEX =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  // Logo "BookOpen" lucide en SVG data-URI (pas de fetch/emoji, qui rendrait
  // du tofu dans satori) pour la ligne de marque en bas de carte.
  private static readonly BOOK_ICON =
    "data:image/svg+xml," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 7v14'/><path d='M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'/></svg>",
    );

  async render(params: {
    title?: string;
    arabic?: string;
    transliteration?: string;
    body?: string;
    source?: string;
  }): Promise<Buffer> {
    const [{ default: satori }, { default: sharp }] = await Promise.all([
      import("satori"),
      import("sharp"),
    ]);

    const hasArabic = OgService.ARABIC_REGEX.test((params.arabic ?? "").trim());

    const fontData = hasArabic ? await this.loadFont() : undefined;

    const svg = await satori(this.buildCard(params, hasArabic) as ReactNode, {
      width: 1200,
      height: 630,
      fonts:
        hasArabic && fontData
          ? [{ name: "arabic", data: fontData, weight: 400 as const, style: "normal" as const }]
          : [],
    });

    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    return png;
  }

  /** Lit la police Amiri (WOFF, pas WOFF2 - le parseur de satori ne lit pas le WOFF2). */
  private async loadFont(): Promise<Buffer> {
    if (this.fontCache) return this.fontCache;
    const candidates = [
      // dist (nest build) : dist/modules/og -> apps/api/assets
      path.resolve(__dirname, "../../../assets/amiri-arabic-400-normal.woff"),
      // cwd = racine du monorepo (docker runtime WORKDIR /app)
      path.resolve(process.cwd(), "apps/api/assets/amiri-arabic-400-normal.woff"),
      // cwd = apps/api
      path.resolve(process.cwd(), "assets/amiri-arabic-400-normal.woff"),
    ];
    let lastError: unknown;
    for (const candidate of candidates) {
      try {
        const buffer = await readFile(candidate);
        this.fontCache = buffer;
        return buffer;
      } catch (error) {
        lastError = error;
      }
    }
    this.logger.error("Police Amiri introuvable", String(lastError));
    throw new Error("Fichier de police Amiri introuvable (amiri-arabic-400-normal.woff)");
  }

  /** Construit l'arbre d'elements satori (objets simples, pas de JSX ni react). */
  private buildCard(
    params: { title?: string; arabic?: string; transliteration?: string; body?: string; source?: string },
    hasArabic: boolean,
  ): OGElement {
    // props contient style + attributs hors-style (ex. src des <img>).
    const h = (
      type: string,
      props: { style: Record<string, unknown> } & Record<string, unknown>,
      ...children: (string | OGElement | null | undefined)[]
    ): OGElement => ({
      type,
      props: {
        ...props,
        children: children.filter((c): c is string | OGElement => c != null && c !== ""),
      },
    });

    return h(
      "div",
      {
        style: {
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 80,
          background: "linear-gradient(160deg, #1d726b 0%, #123f3b 100%)",
          color: "#ffffff",
          fontFamily: hasArabic ? "arabic" : "system-ui",
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 14,
          },
        },
        hasArabic
          ? h(
              "div",
              {
                style: {
                  display: "flex",
                  direction: "rtl",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 56,
                  lineHeight: 1.7,
                },
              },
              params.arabic ?? "",
            )
          : null,
        params.transliteration
          ? h(
              "div",
              {
                style: {
                  display: "flex",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 30,
                  fontStyle: "italic",
                  lineHeight: 1.5,
                },
              },
              params.transliteration,
            )
          : null,
        !hasArabic && params.title
          ? h(
              "div",
              {
                style: { display: "flex", color: "#ffffff", fontWeight: 700, fontSize: 48, lineHeight: 1.3 },
              },
              params.title,
            )
          : null,
        params.body
          ? h(
              "div",
              {
                style: {
                  display: "flex",
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 500,
                  fontSize: 28,
                  lineHeight: 1.5,
                },
              },
              params.body,
            )
          : null,
      ),
      h(
        "div",
        {
          style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 20 },
        },
        params.source
          ? h(
              "div",
              {
                style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
              },
              h("div", {
                style: { display: "flex", width: 80, height: 1, background: "rgba(255,255,255,0.25)" },
              }),
              h(
                "div",
                {
                  style: {
                    display: "flex",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 22,
                    fontWeight: 500,
                    textAlign: "center",
                  },
                },
                params.source,
              ),
            )
          : null,
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 700,
              fontSize: 26,
            },
          },
          h("img", { style: { display: "flex", width: 34, height: 34 }, src: OgService.BOOK_ICON }),
          "myQurandeen",
        ),
        h(
          "div",
          { style: { display: "flex", color: "rgba(255,255,255,0.5)", fontSize: 16 } },
          "myqurandeen.vercel.app",
        ),
      ),
    );
  }
}
