import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { DailyService } from "./daily.service";

/**
 * Contenu du jour (accueil) : verset + hadith, memes pour tous les
 * visiteurs le meme jour calendaire UTC. Mis en cache comme le reste du
 * contenu de reference (CacheInterceptor, TTL global 1h defini dans
 * AppModule) - un decalage eventuel de quelques minutes/heures au
 * changement de jour UTC est sans consequence pour ce besoin.
 */
@ApiTags("daily")
@Public()
@UseInterceptors(CacheInterceptor)
@Controller("daily")
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  @Get()
  async getDaily() {
    const [verse, hadith] = await Promise.all([this.dailyService.getDailyVerse(), this.dailyService.getDailyHadith()]);
    return { verse, hadith };
  }
}
