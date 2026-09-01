import { IsNumber, IsOptional, IsString, IsUrl, Max, Min, MinLength } from "class-validator";

export class SubscribePushDto {
  @IsUrl({ require_tld: false })
  endpoint!: string;

  @IsString()
  @MinLength(1)
  p256dh!: string;

  @IsString()
  @MinLength(1)
  auth!: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  /** Fuseau horaire IANA de l'utilisateur, capture cote client (Intl). */
  @IsOptional()
  @IsString()
  timezone?: string;

  /** Position WGS84 capturee cote client (geoloc navigateur au moment de l'autorisation push). */
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
