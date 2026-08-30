import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { pushSubscriptions } from "../../database/schema";
import { WebPushProvider } from "./web-push.provider";

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly webPush: WebPushProvider,
  ) {}

  health() {
    return { ready: this.webPush.isConfigured, vapidPublicKey: this.webPush.publicKey, lastTickAt: this.webPush.lastTickAt };
  }

  /**
   * Envoie immédiatement une notification de test à tous les abonnements de
   * l'utilisateur (bouton "Envoyer un test" de l'onglet Rappels). Sert aussi
   * de diagnostic : un "sent" ici prouve que la chaîne VAPID -> push service
   * fonctionne, et qu'un problème éventuel vient du planificateur.
   */
  async sendTest(userId: string): Promise<{ sent: number; total: number }> {
    const subs = await this.db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    let sent = 0;
    for (const sub of subs) {
      const result = await this.webPush.send(sub, {
        title: "myQurandeen",
        body: "Test notification.",
        url: "/",
      });
      if (result === "sent") sent += 1;
      if (result === "gone") {
        await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
    }
    return { sent, total: subs.length };
  }

  async subscribe(
    userId: string,
    input: { endpoint: string; p256dh: string; auth: string; userAgent?: string },
  ) {
    // Un meme endpoint peut deja exister si l'utilisateur s'etait deja
    // abonne (re-souscription silencieuse du navigateur) - on rafraichit
    // simplement les cles plutot que d'echouer sur la contrainte unique.
    await this.db
      .insert(pushSubscriptions)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: { userId, p256dh: input.p256dh, auth: input.auth, userAgent: input.userAgent, updatedAt: new Date() },
      });
    return { subscribed: true };
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
    return { subscribed: false };
  }

  async isSubscribed(userId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId))
      .limit(1);
    return rows.length > 0;
  }
}
