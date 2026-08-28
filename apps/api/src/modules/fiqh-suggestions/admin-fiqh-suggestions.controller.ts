import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { FiqhSuggestionsService } from "./fiqh-suggestions.service";
import { UpdateFiqhSuggestionStatusDto } from "./dto/update-fiqh-suggestion-status.dto";

@ApiTags("admin-fiqh-suggestions")
@Controller("admin/fiqh-suggestions")
export class AdminFiqhSuggestionsController {
  constructor(private readonly fiqhSuggestionsService: FiqhSuggestionsService) {}

  @RequirePermission("fiqh_suggestion:view")
  @Get()
  list() {
    return this.fiqhSuggestionsService.list();
  }

  @RequirePermission("fiqh_suggestion:resolve")
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateFiqhSuggestionStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.fiqhSuggestionsService.updateStatus(id, dto.status, dto.adminNote, user.sub);
  }
}
