import { IsIn, IsUUID } from "class-validator";
import { TARGET_TYPES } from "@qurandeen/shared";

export class RecordLastReadDto {
  @IsIn(TARGET_TYPES)
  targetType!: string;

  @IsUUID()
  targetId!: string;
}