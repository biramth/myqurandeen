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
   *
   * `devices` liste chaque abonnement cible (hôte du push service, navigateur,
   * configuration VAPID) : sur iOS ce doit etre `web.push.apple.com` depuis
   * la PWA installee - un autre hote signifie que l'abonnement vient d'un
   * contexte different (Safari, Android...) et son envoi ne sera pas affiche.
   */
  async sendTest(userId: string): Promise<{ sent: number; total: number; devices: unknown[] }> {
    const subs = await this.db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    let sent = 0;
    const devices: unknown[] = [];
    for (const sub of subs) {
      const result = await this.webPush.send(sub, {
        title: "myQurandeen",
        body: "Test notification.",
        url: "/",
      });
      devices.push({
        host: new URL(sub.endpoint).host,
        userAgent: sub.userAgent ?? null,
        result,
        sentAt: result === "sent" ? new Date().toISOString() : null,
      });
      if (result === "sent") sent += 1;
      if (result === "gone") {
        await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
    }
    return { sent, total: subs.length, devices };
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

  /**
   * Supprime tous les abonnements push de l'utilisateur. Utilisé par le
   * bouton "Désactiver" : sur iOS le navigateur peut avoir déjà supprimé
   * l'abonnement local (getSubscription() -> null) alors que la base dit
   * encore "abonné" - il faut donc forcer le nettoyage côté serveur.
   */
  async removeAll(userId: string) {
    await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
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
