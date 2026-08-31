import { ConflictException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "node:crypto";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { marketingGroupMembers, marketingGroups, users } from "../../database/schema";
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

export interface MarketingRecipient {
  id: string;
  email: string;
  displayName: string;
  emailVerifiedAt: Date | null;
  marketingOptOut: boolean;
  createdAt: Date;
}

export interface MarketingGroupSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  memberCount: number;
}

const RECIPIENT_COLUMNS = {
  id: users.id,
  email: users.email,
  displayName: users.displayName,
  emailVerifiedAt: users.emailVerifiedAt,
  marketingOptOut: users.marketingOptOut,
  createdAt: users.createdAt,
} as const;

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
   * `groupId` restreint aux membres de ce groupe (toujours filtres actifs +
   * non desabonnes).
   */
  async listEligibleRecipients(groupId?: string): Promise<AnnouncementRecipient[]> {
    if (groupId) {
      return this.db
        .select({ id: users.id, email: users.email, displayName: users.displayName })
        .from(marketingGroupMembers)
        .innerJoin(users, eq(users.id, marketingGroupMembers.userId))
        .where(
          and(
            eq(marketingGroupMembers.groupId, groupId),
            eq(users.isActive, true),
            eq(users.marketingOptOut, false),
          ),
        );
    }
    const rows = await this.db.query.users.findMany({
      where: and(eq(users.isActive, true), eq(users.marketingOptOut, false)),
      columns: { id: true, email: true, displayName: true },
    });
    return rows;
  }

  /**
   * Liste complete pour l'onglet admin ("a qui j'envoie des mails") : comptes
   * actifs, verifies ou non, avec leur statut de desabonnement visible (pas
   * seulement les eligibles) - `search` filtre par email/nom.
   */
  async listRecipients(search?: string): Promise<MarketingRecipient[]> {
    const conditions = [eq(users.isActive, true)];
    const term = search?.trim();
    if (term) {
      const pattern = `%${term}%`;
      conditions.push(or(ilike(users.email, pattern), ilike(users.displayName, pattern))!);
    }
    return this.db
      .select(RECIPIENT_COLUMNS)
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt));
  }

  /** Groupes de segmentation avec leur nombre de membres. */
  async listGroups(): Promise<MarketingGroupSummary[]> {
    return this.db
      .select({
        id: marketingGroups.id,
        name: marketingGroups.name,
        description: marketingGroups.description,
        createdAt: marketingGroups.createdAt,
        memberCount: sql<number>`count(${marketingGroupMembers.userId})`.mapWith(Number),
      })
      .from(marketingGroups)
      .leftJoin(marketingGroupMembers, eq(marketingGroupMembers.groupId, marketingGroups.id))
      .groupBy(marketingGroups.id)
      .orderBy(desc(marketingGroups.createdAt));
  }

  async createGroup(name: string, description?: string) {
    const existing = await this.db.query.marketingGroups.findFirst({ where: eq(marketingGroups.name, name.trim()) });
    if (existing) {
      throw new ConflictException("Un groupe porte deja ce nom");
    }
    const [group] = await this.db
      .insert(marketingGroups)
      .values({ name: name.trim(), description: description?.trim() || null })
      .returning();
    return group;
  }

  async deleteGroup(groupId: string): Promise<void> {
    const [deleted] = await this.db.delete(marketingGroups).where(eq(marketingGroups.id, groupId)).returning({ id: marketingGroups.id });
    if (!deleted) {
      throw new NotFoundException("Groupe introuvable");
    }
  }

  /** Groupe + ses membres (utilise par l'UI pour cocher les destinataires deja dans le groupe). */
  async getGroupWithMembers(groupId: string): Promise<{ group: MarketingGroupSummary; members: MarketingRecipient[] }> {
    const group = await this.db.query.marketingGroups.findFirst({ where: eq(marketingGroups.id, groupId) });
    if (!group) {
      throw new NotFoundException("Groupe introuvable");
    }
    const memberRows = await this.db
      .select(RECIPIENT_COLUMNS)
      .from(marketingGroupMembers)
      .innerJoin(users, eq(users.id, marketingGroupMembers.userId))
      .where(eq(marketingGroupMembers.groupId, groupId))
      .orderBy(desc(users.createdAt));
    const [{ memberCount }] = await this.db
      .select({ memberCount: sql<number>`count(*)`.mapWith(Number) })
      .from(marketingGroupMembers)
      .where(eq(marketingGroupMembers.groupId, groupId));
    return { group: { ...group, memberCount }, members: memberRows };
  }

  async addGroupMembers(groupId: string, userIds: string[]): Promise<{ added: number }> {
    const group = await this.db.query.marketingGroups.findFirst({ where: eq(marketingGroups.id, groupId) });
    if (!group) {
      throw new NotFoundException("Groupe introuvable");
    }
    await this.db
      .insert(marketingGroupMembers)
      .values(userIds.map((userId) => ({ groupId, userId })))
      .onConflictDoNothing();
    return { added: userIds.length };
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    await this.db
      .delete(marketingGroupMembers)
      .where(and(eq(marketingGroupMembers.groupId, groupId), eq(marketingGroupMembers.userId, userId)));
  }

  /**
   * Envoie la campagne "nouvelle version". `dryRun` (par defaut true) ne
   * fait que compter les destinataires eligibles. `testEmail` envoie un
   * unique exemplaire a une adresse donnee (apercu reel dans une boite mail)
   * sans toucher a la base utilisateur ni au flag de desabonnement.
   * `groupId` restreint l'envoi (ou le comptage) aux membres de ce groupe.
   */
  async sendAnnouncement(options: { dryRun?: boolean; testEmail?: string; groupId?: string }): Promise<SendAnnouncementResult> {
    const eligible = await this.listEligibleRecipients(options.groupId);

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
