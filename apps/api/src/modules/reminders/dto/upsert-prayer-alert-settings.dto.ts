import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsNumber, IsString, Max, Min, MinLength } from "class-validator";
import { PRAYER_CALCULATION_METHODS, PRAYER_NAMES } from "../prayer-times";

export class UpsertPrayerAlertSettingsDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsString()
  @MinLength(1)
  timezone!: string;

  @IsIn(PRAYER_CALCULATION_METHODS)
  calculationMethod!: (typeof PRAYER_CALCULATION_METHODS)[number];

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(PRAYER_NAMES, { each: true })
  enabledPrayers!: (typeof PRAYER_NAMES)[number][];

  @IsBoolean()
  isActive!: boolean;
}
