import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateFiqhSuggestionDto {
  @IsString()
  @MinLength(10, { message: "La question doit faire au moins 10 caractères." })
  @MaxLength(500)
  question!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string;
}
