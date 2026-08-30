import { IsIn, IsInt, IsOptional, Matches, Max, Min } from "class-validator";
import { GAMIFICATION_EVENT_TYPES } from "@qurandeen/shared";

export class RecordEventDto {
  @IsIn(GAMIFICATION_EVENT_TYPES)
  type!: string;

  /** Heure locale (0-23) de l'action côté utilisateur : sert aux succès "early bird" / "lecture nocturne". */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  hour?: number;

  /** Date calendaire locale YYYY-MM-DD : alimente l'objectif du jour dans le bon fuseau. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  localDate?: string;
}