import { Body, Controller, Delete, Get, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { UpsertKhatmProgressDto } from "./dto/upsert-khatm-progress.dto";
import { RamadanService } from "./ramadan.service";

/** Suivi de khatm de l'utilisateur connecte - JwtAuthGuard global impose d'etre authentifie. */
@ApiTags("ramadan")
@Controller("ramadan")
export class RamadanController {
  constructor(private readonly ramadanService: RamadanService) {}

  @Get("khatm")
  getKhatmProgress(@CurrentUser() user: RequestUser) {
    return this.ramadanService.getKhatmProgress(user.sub);
  }

  @Put("khatm")
  upsertKhatmProgress(@CurrentUser() user: RequestUser, @Body() dto: UpsertKhatmProgressDto) {
    return this.ramadanService.upsertKhatmProgress(user.sub, dto);
  }

  @Delete("khatm")
  deleteKhatmProgress(@CurrentUser() user: RequestUser) {
    return this.ramadanService.deleteKhatmProgress(user.sub);
  }
}
