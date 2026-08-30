import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, Matches, MinLength } from "class-validator";
import { TARGET_TYPES, type TargetType } from "@qurandeen/shared";

export class CreateNoteDto {
  @IsIn(TARGET_TYPES)
  targetType!: TargetType;

  @IsUUID()
  targetId!: string;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  /** Date calendaire locale du client (YYYY-MM-DD), pour la serie d'activite. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "localDate doit etre au format YYYY-MM-DD" })
  localDate?: string;
}
