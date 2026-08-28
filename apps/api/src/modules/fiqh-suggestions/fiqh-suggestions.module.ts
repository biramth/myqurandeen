import { Module } from "@nestjs/common";
import { FiqhSuggestionsController } from "./fiqh-suggestions.controller";
import { AdminFiqhSuggestionsController } from "./admin-fiqh-suggestions.controller";
import { FiqhSuggestionsService } from "./fiqh-suggestions.service";

@Module({
  controllers: [FiqhSuggestionsController, AdminFiqhSuggestionsController],
  providers: [FiqhSuggestionsService],
})
export class FiqhSuggestionsModule {}
