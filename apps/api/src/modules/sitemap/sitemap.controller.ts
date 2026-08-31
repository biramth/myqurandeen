import { Controller, Get, Header } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SitemapService } from "./sitemap.service";

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
    return this.sitemapService.generate();
  }
}
