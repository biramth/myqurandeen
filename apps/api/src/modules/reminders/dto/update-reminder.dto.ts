import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min, MinLength } from "class-validator";

const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Seuls le planning et l'activation sont modifiables - changer la cible revient a en creer un nouveau. */
export class UpdateReminderDto {
  @IsOptional()
  @Matches(TIME_OF_DAY_PATTERN, { message: "timeOfDay doit etre au format HH:mm" })
  timeOfDay?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
