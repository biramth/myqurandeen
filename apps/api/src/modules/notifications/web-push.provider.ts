import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { eq } from "drizzle-orm";
import * as webpush from "web-push";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { pushSubscriptions } from "../../database/schema";

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

export type PushSendResult = "sent" | "gone" | "error";

/**
 * Fine couche autour de `web-push`. La fonctionnalite entiere reste
 * desactivee (silencieusement, pas d'erreur) tant que les cles VAPID ne sont
 * pas configurees - meme principe que le backend IA (voir ai.module.ts) :
 * un deploiement de test sans cles ne doit pas planter, juste masquer la
 * fonctionnalite cote frontend via /notifications/health.
 */
@Injectable()
export class WebPushProvider {
  private readonly logger = new Logger(WebPushProvider.name);
  readonly publicKey: string | null;
  readonly isConfigured: boolean;
  /** Dernier passage du planificateur de rappels (diagnostic : savoir si le cron tourne bien en prod). */
  lastTickAt: Date | null = null;

  constructor(
    config: ConfigService,
    @Inject(DRIZZLE) private readonly db: Database,
  ) {
    const publicKey = config.get<string>("VAPID_PUBLIC_KEY", "");
    const privateKey = config.get<string>("VAPID_PRIVATE_KEY", "");
    const subject = config.get<string>("VAPID_SUBJECT", "");

    this.isConfigured = Boolean(publicKey && privateKey && subject);
    this.publicKey = this.isConfigured ? publicKey : null;

    if (this.isConfigured) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    } else {
      this.logger.warn("VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT absents - notifications push desactivees.");
    }
  }

  async send(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: PushPayload,
  ): Promise<PushSendResult> {
    if (!this.isConfigured) return "error";
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify(payload),
      );
      return "sent";
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      // 404/410 : le navigateur a revoque cet abonnement (desinstallation,
      // permission retiree...) - l'appelant doit alors le supprimer en base.
      if (statusCode === 404 || statusCode === 410) return "gone";
      this.logger.error(`Echec d'envoi push (${statusCode ?? "?"}) : ${(error as Error).message}`);
      return "error";
    }
  }

  /**
   * Comme `send()`, mais supprime automatiquement l'abonnement en base s'il
   * est revoque (404/410) - factorise la logique de nettoyage identique
   * repetee dans les 3 planificateurs et le test manuel.
   */
  async sendAndCleanup(
    subscription: { id: string; endpoint: string; p256dh: string; auth: string },
    payload: PushPayload,
  ): Promise<PushSendResult> {
    const result = await this.send(subscription, payload);
    if (result === "gone") {
      await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subscription.id));
    }
    return result;
  }
}
