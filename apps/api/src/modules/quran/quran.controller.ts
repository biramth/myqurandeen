import { CacheInterceptor } from "@nestjs/cache-manager";
import { Controller, Get, Param, ParseIntPipe, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { QuranService } from "./quran.service";

// Contenu de reference (texte coranique, traductions) : ne change quasiment
// jamais en prod, mis en cache en memoire pour eviter de retaper la DB a
// chaque page vue.
@ApiTags("quran")
@Public()
@UseInterceptors(CacheInterceptor)
@Controller("quran")
export class QuranController {
  constructor(private readonly quranService: QuranService) {}

  @Get("surahs")
  listSurahs() {
    return this.quranService.listSurahs();
  }

  @Get("surahs/:number")
  getSurah(@Param("number", ParseIntPipe) number: number) {
    return this.quranService.getSurahByNumber(number);
  }

  @Get("surahs/:number/verses/:verseNumber")
  getVerse(
    @Param("number", ParseIntPipe) number: number,
    @Param("verseNumber", ParseIntPipe) verseNumber: number,
  ) {
    return this.quranService.getVerse(number, verseNumber);
  }

  @Get("surahs/:number/translations/:translationId")
  getSurahTranslation(
    @Param("number", ParseIntPipe) number: number,
    @Param("translationId") translationId: string,
  ) {
    return this.quranService.getSurahTranslation(number, translationId);
  }

  @Get("translations")
  listTranslations() {
    return this.quranService.listTranslations();
  }

  @ApiOperation({ summary: "Liste des recitateurs disponibles (recitation audio)" })
  @Get("reciters")
  listReciters() {
    return this.quranService.listReciters();
  }

  @ApiOperation({ summary: "URLs de recitation audio par verset et recitateur" })
  @Get("surahs/:number/verses/:verseNumber/audio")
  getVerseAudio(
    @Param("number", ParseIntPipe) number: number,
    @Param("verseNumber", ParseIntPipe) verseNumber: number,
  ) {
    return this.quranService.getVerseAudio(number, verseNumber);
  }

  @ApiOperation({ summary: "Export masse du texte coranique (surates + versets) pour le cache hors-ligne" })
  @Get("export")
  exportBulk() {
    return this.quranService.exportBulk();
  }

  @ApiOperation({ summary: "Export masse d'une traduction pour le cache hors-ligne" })
  @Get("export/translations/:translationId")
  exportTranslation(@Param("translationId") translationId: string) {
    return this.quranService.exportTranslation(translationId);
  }
}
