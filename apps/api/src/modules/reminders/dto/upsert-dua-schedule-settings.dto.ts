import { IsBoolean, IsOptional, IsString, Matches, MinLength } from "class-validator";

const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class UpsertDuaScheduleSettingsDto {
  @IsString()
  @MinLength(1)
  timezone!: string;

  @IsOptional()
  @Matches(TIME_OF_DAY_PATTERN, { message: "morningTime doit etre au format HH:mm" })
  morningTime?: string;

  @IsOptional()
  @Matches(TIME_OF_DAY_PATTERN, { message: "eveningTime doit etre au format HH:mm" })
  eveningTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}