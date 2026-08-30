import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { users } from "../../database/schema";
import { MailService } from "../mail/mail.service";

export interface AnnouncementRecipient {
  id: string;
  email: string;
  displayName: string;
}

export interface SendAnnouncementResult {
  dryRun: boolean;
  test: boolean;
  sent: number;
  failed: number;
  eligible: number;
}

/**
 * Campagnes email (annonces, nouvelle version...) - distinctes des emails
 * transactionnels geres directement par AuthService/MailService. Reserve a
 * SUPER_ADMIN (permission marketing:send) car ca touche potentiellement
 * toute la base utilisateur d'un coup.
 */
@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);
  /**
   * Cle HMAC pour signer les liens de desabonnement (pas de table dediee :
   * le lien est stateless et n'expire jamais, contrairement aux jetons de
   * verification/reset qui sont a usage unique - voir AuthTokensService).
   * Reutilise JWT_REFRESH_SECRET plutot que d'ajouter une variable d'env
   * dediee : deja un secret fort obligatoire, jamais expose au client, et
   * cet usage (HMAC simple, pas un JWT) ne cree pas de collision de risque.
   */
  private readonly unsubscribeSecret: string;

  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.unsubscribeSecret = this.config.get<string>("JWT_REFRESH_SECRET", "");
  }

  buildUnsubscribeUrl(userId: string): string {
    const token = `${userId}.${this.signUnsubscribeToken(userId)}`;
    return `${this.mailService.webUrl}/desabonnement?token=${encodeURIComponent(token)}`;
  }

  private signUnsubscribeToken(userId: string): string {
    return createHmac("sha256", this.unsubscribeSecret).update(userId).digest("base64url");
  }

  private verifyUnsubscribeToken(token: string): string | null {
    const separatorIndex = token.lastIndexOf(".");
    if (separatorIndex <= 0) return null;

    const userId = token.slice(0, separatorIndex);
    const signature = token.slice(separatorIndex + 1);
    const expected = this.signUnsubscribeToken(userId);

    const provided = Buffer.from(signature);
    const reference = Buffer.from(expected);
    if (provided.length !== reference.length || !timingSafeEqual(provided, reference)) {
      return null;
    }
    return userId;
  }

  /** Desabonne le titulaire du jeton des emails marketing (idempotent - reclique sans risque). */
  async unsubscribe(token: string): Promise<{ email: string }> {
    const userId = this.verifyUnsubscribeToken(token);
    if (!userId) {
      throw new UnauthorizedException("Lien de désabonnement invalide");
    }

    const [updated] = await this.db
      .update(users)
      .set({ marketingOptOut: true })
      .where(eq(users.id, userId))
      .returning({ email: users.email });

    if (!updated) {
      throw new NotFoundException("Compte introuvable");
    }
    return updated;
  }

  /**
   * Comptes actifs n'ayant pas demande a etre exclus des emails marketing,
   * emails verifies ou non : l'utilisateur s'est inscrit avec cette adresse,
   * il peut recevoir une annonce meme avant d'avoir confirme sa verification.
   */
  async listEligibleRecipients(): Promise<AnnouncementRecipient[]> {
    const rows = await this.db.query.users.findMany({
      where: and(eq(users.isActive, true), eq(users.marketingOptOut, false)),
      columns: { id: true, email: true, displayName: true },
    });
    return rows;
  }

  /**
   * Envoie la campagne "nouvelle version". `dryRun` (par defaut true) ne
   * fait que compter les destinataires eligibles. `testEmail` envoie un
   * unique exemplaire a une adresse donnee (apercu reel dans une boite mail)
   * sans toucher a la base utilisateur ni au flag de desabonnement.
   */
  async sendAnnouncement(options: { dryRun?: boolean; testEmail?: string }): Promise<SendAnnouncementResult> {
    const eligible = await this.listEligibleRecipients();

    if (options.testEmail) {
      const { subject, html } = this.mailService.buildAnnouncementEmail({
        displayName: options.testEmail.split("@")[0],
        // Lien de desabonnement factice (pas un vrai userId) : un email de
        // test ne doit pas pouvoir desabonner un compte reel s'il est cliqué.
        unsubscribeUrl: `${this.mailService.webUrl}/desabonnement`,
      });
      await this.mailService.send(options.testEmail, `[TEST] ${subject}`, html);
      return { dryRun: false, test: true, sent: 1, failed: 0, eligible: eligible.length };
    }

    const dryRun = options.dryRun ?? true;
    if (dryRun) {
      return { dryRun: true, test: false, sent: 0, failed: 0, eligible: eligible.length };
    }

    let sent = 0;
    let failed = 0;
    for (const recipient of eligible) {
      const { subject, html } = this.mailService.buildAnnouncementEmail({
        displayName: recipient.displayName,
        unsubscribeUrl: this.buildUnsubscribeUrl(recipient.id),
      });
      try {
        await this.mailService.send(recipient.email, subject, html);
        sent++;
      } catch (error) {
        failed++;
        this.logger.error(
          `Échec d'envoi de la campagne à ${recipient.email}`,
          error instanceof Error ? error.stack : error,
        );
      }
      // Petite pause entre chaque envoi pour rester sous les limites de
      // debit de l'API Brevo plutot que de la marteler d'un coup.
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    this.logger.log(
      `Campagne "nouvelle version" : ${sent} envoyés, ${failed} échecs, ${eligible.length} destinataires éligibles.`,
    );
    return { dryRun: false, test: false, sent, failed, eligible: eligible.length };
  }
}
