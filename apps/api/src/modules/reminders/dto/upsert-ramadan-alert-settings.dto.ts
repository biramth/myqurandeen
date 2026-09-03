import { IsBoolean, IsString, Matches, MinLength } from "class-validator";

const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class UpsertRamadanAlertSettingsDto {
  @Matches(TIME_OF_DAY_PATTERN, { message: "timeOfDay doit etre au format HH:mm" })
  timeOfDay!: string;

  @IsString()
  @MinLength(1)
  timezone!: string;

  @IsBoolean()
  isActive!: boolean;
}
