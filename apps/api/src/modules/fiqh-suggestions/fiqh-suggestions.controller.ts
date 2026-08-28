import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { FiqhSuggestionsService } from "./fiqh-suggestions.service";
import { CreateFiqhSuggestionDto } from "./dto/create-fiqh-suggestion.dto";

/**
 * Endpoint public (authentifie, sans permission speciale requise - comme
 * les favoris ou les notes) permettant a tout utilisateur connecte de
 * suggerer un nouveau sujet pour le comparateur de fiqh. La gestion
 * (consultation, changement de statut) se fait cote admin, voir
 * AdminFiqhSuggestionsController.
 */
@ApiTags("fiqh-suggestions")
@Controller("fiqh/suggestions")
export class FiqhSuggestionsController {
  constructor(private readonly fiqhSuggestionsService: FiqhSuggestionsService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateFiqhSuggestionDto) {
    return this.fiqhSuggestionsService.create(user.sub, dto.question, dto.context);
  }
}
