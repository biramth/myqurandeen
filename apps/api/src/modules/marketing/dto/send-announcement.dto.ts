import { IsBoolean, IsEmail, IsOptional, IsUUID } from "class-validator";

export class SendAnnouncementDto {
  /**
   * Par defaut true : renvoie juste le nombre de destinataires eligibles
   * sans rien envoyer. Il faut explicitement passer `false` pour declencher
   * un envoi reel - evite un envoi accidentel a toute la base.
   */
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  /** Envoie un unique email de test a cette adresse plutot qu'a toute la base. */
  @IsOptional()
  @IsEmail({}, { message: "Email invalide" })
  testEmail?: string;

  /** Restreint la campagne aux membres de ce groupe plutot qu'a toute la base. */
  @IsOptional()
  @IsUUID()
  groupId?: string;
}
