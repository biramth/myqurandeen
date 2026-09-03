import { Controller, Get, Header, Param, ParseEnumPipe, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SitemapService, type SitemapPart } from "./sitemap.service";

/**
 * Mis en cache comme le reste du contenu de reference (CacheInterceptor,
 * TTL global 1h defini dans AppModule) - `sitemap-data/hadith.xml` genere
 * ~33 500 URLs (3,5 Mo, ~9s sans cache sur l'instance Render gratuite) : au
 * dela du delai d'attente du crawler de Google, qui a fini par rapporter
 * "impossible de recuperer le sitemap" (Search Console) meme si la reponse
 * finissait par arriver. Avec le cache, seule la toute premiere requete
 * apres un redemarrage/expiration paie ce cout - les suivantes (dont les
 * nouvelles tentatives de Google) sont quasi instantanees. Reduit aussi la
 * pression sur le pool Postgres partage (voir SitemapService et
 * common/concurrency/db-query-semaphore.ts).
 */
@ApiTags("sitemap")
@Public()
@UseInterceptors(CacheInterceptor)
@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get("sitemap.xml")
  @Header("Content-Type", "application/xml; charset=utf-8")
  @Header("Cache-Control", "public, max-age=3600")
  sitemap(): Promise<string> {
    return this.sitemapService.generateIndex();
  }

  /** Sous-sitemap par categorie. Route identique au pattern de l'index pour simplifier le rewrite Vercel. */
  @Get("sitemap-data/:part.xml")
  @Header("Content-Type", "application/xml; charset=utf-8")
  @Header("Cache-Control", "public, max-age=3600")
  sitemapPart(@Param("part", new ParseEnumPipe(["static", "quran", "hadith"])) part: SitemapPart): Promise<string> {
    return this.sitemapService.generatePart(part);
  }
}
