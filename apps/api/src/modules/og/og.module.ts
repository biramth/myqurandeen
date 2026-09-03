import { Module } from "@nestjs/common";
import { ConceptsModule } from "../concepts/concepts.module";
import { DuasModule } from "../duas/duas.module";
import { HadithModule } from "../hadith/hadith.module";
import { HistoryModule } from "../history/history.module";
import { QuranModule } from "../quran/quran.module";
import { ScholarsModule } from "../scholars/scholars.module";
import { OgController } from "./og.controller";
import { OgPageController } from "./og-page.controller";
import { OgPageService } from "./og-page.service";
import { OgService } from "./og.service";

@Module({
  imports: [QuranModule, HadithModule, DuasModule, HistoryModule, ConceptsModule, ScholarsModule],
  controllers: [OgController, OgPageController],
  providers: [OgService, OgPageService],
  exports: [OgPageService, OgService],
})
export class OgModule {}
