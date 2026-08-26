import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { QuranService } from "./quran.service";

@ApiTags("quran")
@Public()
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
}
