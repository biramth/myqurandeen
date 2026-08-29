import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { RemindersService } from "./reminders.service";
import { CreateReminderDto } from "./dto/create-reminder.dto";
import { UpdateReminderDto } from "./dto/update-reminder.dto";
import { UpsertRotationSettingsDto } from "./dto/upsert-rotation-settings.dto";

/**
 * Rappels notification de l'utilisateur connecte - JwtAuthGuard global
 * impose d'etre authentifie. Les routes "rotation-settings" (segment
 * litteral) sont declarees avant ":id" : Nest/Express matchent dans l'ordre
 * de declaration, donc ":id" intercepterait sinon "rotation-settings" comme
 * s'il s'agissait d'un identifiant de rappel.
 */
@ApiTags("reminders")
@Controller("reminders")
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get("rotation-settings")
  getRotationSettings(@CurrentUser() user: RequestUser) {
    return this.remindersService.getRotationSettings(user.sub);
  }

  @Put("rotation-settings")
  upsertRotationSettings(@CurrentUser() user: RequestUser, @Body() dto: UpsertRotationSettingsDto) {
    return this.remindersService.upsertRotationSettings(user.sub, dto);
  }

  @Delete("rotation-settings")
  deleteRotationSettings(@CurrentUser() user: RequestUser) {
    return this.remindersService.deleteRotationSettings(user.sub);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.remindersService.list(user.sub);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(user.sub, dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: UpdateReminderDto) {
    return this.remindersService.update(user.sub, id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.remindersService.remove(user.sub, id);
  }
}
