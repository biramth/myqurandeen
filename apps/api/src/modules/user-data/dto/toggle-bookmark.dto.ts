import { IsIn, IsUUID } from "class-validator";
import { TARGET_TYPES, type TargetType } from "@qurandeen/shared";

export class ToggleBookmarkDto {
  @IsIn(TARGET_TYPES)
  targetType!: TargetType;

  @IsUUID()
  targetId!: string;
}
