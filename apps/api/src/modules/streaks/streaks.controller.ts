import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { StreaksService } from "./streaks.service";
import { PingStreakDto } from "./dto/ping-streak.dto";

/** Serie d'activite quotidienne ("flamme") de l'utilisateur connecte - JwtAuthGuard global impose d'etre authentifie. */
@ApiTags("streaks")
@Controller("streaks")
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  @Get("me")
  getStreak(@CurrentUser() user: RequestUser, @Query("localDate") localDate?: string) {
    return this.streaksService.getStreak(user.sub, localDate);
  }

  /** Enregistre une activite pour aujourd'hui (idempotent) - appele quand l'utilisateur lit du contenu (Coran, hadith, dua...). */
  @Post("ping")
  @HttpCode(HttpStatus.OK)
  ping(@CurrentUser() user: RequestUser, @Body() dto: PingStreakDto) {
    return this.streaksService.recordActivity(user.sub, dto.localDate);
  }
}
