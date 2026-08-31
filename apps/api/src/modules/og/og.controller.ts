import { Controller, Get, Logger, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { OgService } from "./og.service";

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * GET /og - image Open Graph 1200x630 par contenu. Public (les crawlers de
 * partage ne portent jamais de JWT). Atteint via le rewrite Vercel qui envoie
 * /api/og -> ce backend. Le query string est deja decode par Express.
 */
@ApiTags("og")
@Controller("og")
export class OgController {
  private readonly logger = new Logger(OgController.name);

  constructor(private readonly ogService: OgService) {}

  /** Public : consomme par les robots d'apercu de lien, jamais par un utilisateur connecte. */
  @Public()
  @Get()
  async generate(
    @Query()
    query: {
      title?: string;
      arabic?: string;
      transliteration?: string;
      body?: string;
      source?: string;
    },
    @Res() res: Response,
  ): Promise<void> {
    try {
      const png = await this.ogService.render({
        title: truncate(query.title ?? "", 400),
        arabic: truncate(query.arabic ?? "", 500),
        transliteration: truncate(query.transliteration ?? "", 400),
        body: truncate(query.body ?? "", 400),
        source: query.source ?? undefined,
      });
      res.setHeader("Content-Type", "image/png");
      // Met en cache chez le crawler ET cote CDN : une carte est renetee
      // rarement ; ca amortit le cold-start de Render (plus lent qu'une
      // fonction serveuse dediee).
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.setHeader("Content-Length", String(png.length));
      res.status(200).send(png);
    } catch (error) {
      this.logger.error("Erreur generation image OG", error instanceof Error ? error.stack : String(error));
      res.status(500).type("text/plain").send("Erreur generation image OG");
    }
  }
}
