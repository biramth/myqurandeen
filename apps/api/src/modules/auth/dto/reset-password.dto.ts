import { IsString, Length } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @Length(8, 72, { message: "Le mot de passe doit contenir entre 8 et 72 caracteres" })
  password!: string;
}
