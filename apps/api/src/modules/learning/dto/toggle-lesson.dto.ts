import { IsOptional, Matches } from "class-validator";

export class ToggleLessonDto {
  /** Date calendaire locale du client (YYYY-MM-DD), pour la serie d'activite. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "localDate doit etre au format YYYY-MM-DD" })
  localDate?: string;
}
