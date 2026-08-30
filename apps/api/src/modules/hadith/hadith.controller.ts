import { CacheInterceptor } from "@nestjs/cache-manager";
import { Controller, Get, Param, ParseIntPipe, Query, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { HadithService } from "./hadith.service";

@ApiTags("hadith")
@Public()
@UseInterceptors(CacheInterceptor)
@Controller("hadith")
export class HadithController {
  constructor(private readonly hadithService: HadithService) {}

  @Get("collections")
  listCollections() {
    return this.hadithService.listCollections();
  }

  @Get("collections/:slug")
  getCollection(@Param("slug") slug: string) {
    return this.hadithService.getCollectionBySlug(slug);
  }

  @Get("collections/:slug/translations")
  listCollectionTranslations(@Param("slug") slug: string) {
    return this.hadithService.listCollectionTranslations(slug);
  }

  @Get("collections/:slug/books/:bookNumber/translations/:translationId")
  getBookTranslation(
    @Param("slug") slug: string,
    @Param("bookNumber", ParseIntPipe) bookNumber: number,
    @Param("translationId") translationId: string,
  ) {
    return this.hadithService.getBookTranslation(slug, bookNumber, translationId);
  }

  @Get("collections/:slug/books/:bookNumber")
  getBookHadiths(
    @Param("slug") slug: string,
    @Param("bookNumber", ParseIntPipe) bookNumber: number,
    @Query("page") page?: string,
  ) {
    return this.hadithService.getBookHadiths(slug, bookNumber, page ? Number(page) : undefined);
  }

  @Get("collections/:slug/hadiths/:number")
  getHadith(@Param("slug") slug: string, @Param("number") number: string) {
    return this.hadithService.getHadithDetail(slug, number);
  }
}
