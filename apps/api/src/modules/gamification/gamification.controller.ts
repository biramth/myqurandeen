import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { GamificationService } from "./gamification.service";
import { RecordEventDto } from "./dto/record-event.dto";
import type { GamificationEventType } from "@qurandeen/shared";

/** Sous-système gamification (XP, niveaux, succès, objectif du jour) de l'utilisateur connecté. */
@ApiTags("gamification")
@Controller("gamification")
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get()
  getProfile(@CurrentUser() user: RequestUser, @Query("localDate") localDate?: string) {
    return this.gamificationService.getProfile(user.sub, localDate);
  }

  /** Enregistre une action significative (lecture, leçon, note...) et renvoie ce que ça déclenche (XP, niveau, succès). */
  @Post("events")
  @HttpCode(HttpStatus.OK)
  recordEvent(@CurrentUser() user: RequestUser, @Body() dto: RecordEventDto) {
    return this.gamificationService.recordEvent(user.sub, dto.type as GamificationEventType, {
      hour: dto.hour,
      localDate: dto.localDate,
    });
  }
}