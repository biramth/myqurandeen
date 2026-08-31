import { Controller, Get, Logger, NotFoundException, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { OgPageService } from "./og-page.service";

/**
 * GET /og-page?path=/quran/2/255 - pre-rendu HTML (head SEO/Open Graph) d'un
 * contenu donne, consomme par le middleware Edge Vercel pour les crawlers
 * d'apercu de lien qui n'executent pas le JS de la SPA. Public (aucun JWT).
 */
@ApiTags("og")
@Controller("og-page")
export class OgPageController {
  private readonly logger = new Logger(OgPageController.name);

  constructor(private readonly ogPageService: OgPageService) {}

  @Public()
  @Get()
  async renderPage(
    @Query("path") path: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const html = await this.ogPageService.renderHtml(path ?? "");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.status(200).send(html);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).type("text/plain").send("Contenu introuvable");
        return;
      }
      this.logger.error(
        "Erreur prerender OG page",
        error instanceof Error ? error.stack : String(error),
      );
      res.status(500).type("text/plain").send("Erreur prerender OG");
    }
  }
}
