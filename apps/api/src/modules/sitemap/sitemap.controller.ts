import { Controller, Get, Header, Param, ParseEnumPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SitemapService, type SitemapPart } from "./sitemap.service";

@ApiTags("sitemap")
@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  /** Public : consomme par les robots d'indexation, jamais par un utilisateur connecte. */
  @Public()
  @Get("sitemap.xml")
  @Header("Content-Type", "application/xml; charset=utf-8")
  @Header("Cache-Control", "public, max-age=3600")
  sitemap(): Promise<string> {
    return this.sitemapService.generateIndex();
  }

  /** Sous-sitemap par categorie. Route identique au pattern de l'index pour simplifier le rewrite Vercel. */
  @Public()
  @Get("sitemap-data/:part.xml")
  @Header("Content-Type", "application/xml; charset=utf-8")
  @Header("Cache-Control", "public, max-age=3600")
  sitemapPart(@Param("part", new ParseEnumPipe(["static", "quran", "hadith"])) part: SitemapPart): Promise<string> {
    return this.sitemapService.generatePart(part);
  }
}
