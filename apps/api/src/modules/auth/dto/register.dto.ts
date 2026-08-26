import { IsEmail, IsString, Length } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Email invalide" })
  email!: string;

  @IsString()
  @Length(8, 72, { message: "Le mot de passe doit contenir entre 8 et 72 caracteres" })
  password!: string;

  @IsString()
  @Length(2, 120, { message: "Le nom affiche doit contenir entre 2 et 120 caracteres" })
  displayName!: string;
}
