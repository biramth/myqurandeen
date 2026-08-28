import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { FIQH_SUGGESTION_STATUSES, type FiqhSuggestionStatus } from "@qurandeen/shared";

export class UpdateFiqhSuggestionStatusDto {
  @IsIn(FIQH_SUGGESTION_STATUSES)
  status!: FiqhSuggestionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
