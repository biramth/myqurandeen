import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { TafsirService } from "./tafsir.service";

@ApiTags("tafsir")
@Public()
@Controller("tafsir")
export class TafsirController {
  constructor(private readonly tafsirService: TafsirService) {}

  @Get("works")
  listWorks() {
    return this.tafsirService.listWorks();
  }

  @Get("surahs/:surahNumber/:tafsirSourceId")
  getSurahTafsir(
    @Param("surahNumber", ParseIntPipe) surahNumber: number,
    @Param("tafsirSourceId") tafsirSourceId: string,
  ) {
    return this.tafsirService.getSurahTafsir(surahNumber, tafsirSourceId);
  }

  @Get("verse/:surahNumber/:verseNumber")
  getVerseTafsirs(
    @Param("surahNumber", ParseIntPipe) surahNumber: number,
    @Param("verseNumber", ParseIntPipe) verseNumber: number,
  ) {
    return this.tafsirService.getVerseTafsirs(surahNumber, verseNumber);
  }
}
