import { IsUUID } from "class-validator";

export class AssignReportDto {
  @IsUUID()
  moderatorId!: string;
}
