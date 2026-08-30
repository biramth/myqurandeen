import { IsIn, IsOptional, IsUUID, Matches } from "class-validator";
import { TARGET_TYPES, type TargetType } from "@qurandeen/shared";

export class AddCollectionItemDto {
  @IsIn(TARGET_TYPES)
  targetType!: TargetType;

  @IsUUID()
  targetId!: string;

  /** Date calendaire locale du client (YYYY-MM-DD), pour la serie d'activite. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "localDate doit etre au format YYYY-MM-DD" })
  localDate?: string;
}
