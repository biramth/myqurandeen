import { IsOptional, Matches } from "class-validator";

export class PingStreakDto {
  /** Date calendaire locale du client (YYYY-MM-DD) - evite les bugs de fuseau horaire pres de minuit. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "localDate doit etre au format YYYY-MM-DD" })
  localDate?: string;
}
