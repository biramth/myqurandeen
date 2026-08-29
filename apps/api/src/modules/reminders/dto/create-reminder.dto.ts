import { ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min, MinLength } from "class-validator";
import { REMINDER_TARGET_TYPES, type ReminderTargetType } from "@qurandeen/shared";

const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateReminderDto {
  @IsIn(REMINDER_TARGET_TYPES)
  targetType!: ReminderTargetType;

  /** UUID d'une dua/categorie ; requis sauf pour targetType = "surah". */
  @IsOptional()
  @IsUUID()
  targetId?: string;

  /** 1-114 ; requis seulement pour targetType = "surah". */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber?: number;

  @Matches(TIME_OF_DAY_PATTERN, { message: "timeOfDay doit etre au format HH:mm" })
  timeOfDay!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek!: number[];

  @IsString()
  @MinLength(1)
  timezone!: string;
}
