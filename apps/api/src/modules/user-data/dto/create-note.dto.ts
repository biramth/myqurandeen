import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, MinLength } from "class-validator";
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
}
