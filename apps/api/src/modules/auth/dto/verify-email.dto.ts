import { IsEmail, IsString } from "class-validator";

export class VerifyEmailDto {
  @IsString()
  token!: string;
}

export class ResendVerificationDto {
  @IsEmail({}, { message: "Email invalide" })
  email!: string;
}
