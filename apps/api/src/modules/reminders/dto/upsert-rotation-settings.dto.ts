import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsString, Matches, Max, Min, MinLength } from "class-validator";

const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class UpsertRotationSettingsDto {
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

  @IsBoolean()
  isActive!: boolean;
}
