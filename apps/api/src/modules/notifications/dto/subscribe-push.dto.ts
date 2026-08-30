import { IsOptional, IsString, IsUrl, MinLength } from "class-validator";

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
}
