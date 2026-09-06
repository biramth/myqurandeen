import { Controller, Get, Logger, Param, ParseIntPipe, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { QuranService } from "./quran.service";

/**
 * Proxy de telechargement audio, dans un controleur separe de QuranController
 * (pas de `@UseInterceptors(CacheInterceptor)` herite, meme raisonnement que
 * OgController : reponse binaire streamee, pas une valeur JSON a mettre en
 * cache en memoire). Sert uniquement le telechargement hors-ligne (voir
 * useOfflineAudioDownload.ts) - la lecture en streaming (`<audio src>`)
 * continue d'utiliser l'URL CDN directe, qui n'a pas besoin de CORS.
 */
@ApiTags("quran")
@Public()
@Controller("quran")
export class QuranAudioProxyController {
  private readonly logger = new Logger(QuranAudioProxyController.name);

  constructor(private readonly quranService: QuranService) {}

  @ApiOperation({ summary: "Proxy de telechargement audio (contourne l'absence de CORS du CDN) - cache hors-ligne" })
  @Get("surahs/:number/verses/:verseNumber/audio/:reciterSlug/download")
  async download(
    @Param("number", ParseIntPipe) number: number,
    @Param("verseNumber", ParseIntPipe) verseNumber: number,
    @Param("reciterSlug") reciterSlug: string,
    @Res() res: Response,
  ): Promise<void> {
    const url = await this.quranService.getVerseAudioUrl(number, verseNumber, reciterSlug);

    let upstream: globalThis.Response;
    try {
      upstream = await fetch(url);
    } catch (error) {
      this.logger.error(`Echec fetch CDN audio ${url}`, error instanceof Error ? error.stack : String(error));
      res.status(502).end();
      return;
    }

    if (!upstream.ok || !upstream.body) {
      res.status(502).end();
      return;
    }

    res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "audio/mpeg");
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);
    // Fichier CDN immuable (edition de recitateur figee) - cache long cote navigateur.
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200);

    const reader = upstream.body.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    } finally {
      res.end();
    }
  }
}
